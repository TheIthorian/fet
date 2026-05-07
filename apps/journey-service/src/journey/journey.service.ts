import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { ulid } from 'ulid';
import { firstValueFrom } from 'rxjs';
import { ActiveJourney } from './schemas/active-journey.schema';
import type { PostLocationDto } from './dto/post-location.dto';

const MIN_VELOCITY_TO_START = 7; // m/s
const MAX_VELOCITY_TO_STOP = 1; // m/s
const MIN_STATIONARY_MS = 60_000; // 1 minute

interface Coordinates {
    lat: number;
    lon: number;
}

@Injectable()
export class JourneyService {
    private readonly logger = new Logger(JourneyService.name);

    constructor(
        @InjectModel(ActiveJourney.name) private readonly model: Model<ActiveJourney>,
        private readonly httpService: HttpService,
        private readonly config: ConfigService,
    ) {}

    async handlePostLocation(dto: PostLocationDto) {
        const { userId, lat, lon, created_at, velocity, distance } = dto;
        const createdAt = new Date(created_at);

        const active = await this.model.findOne({ userId });

        if (!active) {
            if (velocity && velocity > MIN_VELOCITY_TO_START) {
                return this.startJourney(userId, createdAt, { lat, lon });
            }
            return null;
        }

        if (active.status === 'new') {
            return this.advanceNewJourney(active, lat, lon, distance, createdAt);
        }

        // inProgress
        const timeSinceLastReading = createdAt.getTime() - active.lastReadingDate!.getTime();
        const actualDistance = distance ?? calcDistance(active.lastLocation, { lat, lon });
        const actualVelocity = velocity ?? (1000 * actualDistance) / timeSinceLastReading;
        const timeSinceSignificant =
            createdAt.getTime() - active.lastSignificantReadingDate!.getTime();

        if (timeSinceSignificant > MIN_STATIONARY_MS && actualVelocity < MAX_VELOCITY_TO_STOP) {
            return this.completeJourney(active, createdAt);
        }

        return this.updateInProgressJourney(
            active,
            actualDistance,
            actualVelocity,
            lat,
            lon,
            createdAt,
        );
    }

    private async startJourney(
        userId: string,
        startTime: Date,
        location: Coordinates,
    ): Promise<ActiveJourney> {
        const journeyId = ulid();
        const journey = await this.model.create({
            userId,
            journeyId,
            status: 'new',
            startTime,
            startLocation: location,
            lastLocation: location,
            distance: 0,
        });
        this.logger.log(`Started journey ${journeyId} for user ${userId}`);
        return journey;
    }

    private async advanceNewJourney(
        journey: ActiveJourney,
        lat: number,
        lon: number,
        distance: number | undefined,
        createdAt: Date,
    ) {
        const delta = distance ?? calcDistance(journey.startLocation, { lat, lon });
        return this.model.findOneAndUpdate(
            { _id: journey._id },
            {
                $set: {
                    status: 'inProgress',
                    lastLocation: { lat, lon },
                    lastReadingDate: createdAt,
                    lastSignificantReadingDate: createdAt,
                    distance: journey.distance + delta,
                },
            },
            { new: true },
        );
    }

    private async updateInProgressJourney(
        journey: ActiveJourney,
        distanceToAdd: number,
        velocity: number,
        lat: number,
        lon: number,
        createdAt: Date,
    ) {
        const isSignificant = velocity >= MAX_VELOCITY_TO_STOP;
        return this.model.findOneAndUpdate(
            { _id: journey._id },
            {
                $set: {
                    lastLocation: { lat, lon },
                    lastReadingDate: createdAt,
                    lastSignificantReadingDate: isSignificant
                        ? createdAt
                        : journey.lastSignificantReadingDate,
                    distance: journey.distance + distanceToAdd,
                },
            },
            { new: true },
        );
    }

    private async completeJourney(journey: ActiveJourney, endTime: Date) {
        await this.model.deleteOne({ _id: journey._id });
        this.logger.log(`Completed journey ${journey.journeyId}`);

        const completed = {
            id: journey.journeyId,
            userId: journey.userId,
            startTime: journey.startTime,
            endTime,
            distance: journey.distance,
            startLocation: journey.startLocation,
            lastLocation: journey.lastLocation,
        };

        void this.notifyMain(completed);
        return { ...completed, status: 'completed' };
    }

    private async notifyMain(journey: Record<string, unknown>) {
        const mainUrl = this.config.get<string>('MAIN_APP_URL', 'http://localhost:3000');
        const key = this.config.get<string>('INTERNAL_KEY', '');
        try {
            await firstValueFrom(
                this.httpService.post(`${mainUrl}/iapi/journey`, journey, {
                    headers: { 'x-internal-key': key },
                }),
            );
        } catch (err) {
            this.logger.error(`Failed to notify main of completed journey ${journey['id']}`, err);
        }
    }
}

function calcDistance(a: Coordinates, b: Coordinates): number {
    const R = 6371000;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const dLat = lat2 - lat1;
    const dLon = ((b.lon - a.lon) * Math.PI) / 180;
    const x = dLon * Math.cos((lat1 + lat2) / 2);
    return Math.sqrt(x * x + dLat * dLat) * R;
}
