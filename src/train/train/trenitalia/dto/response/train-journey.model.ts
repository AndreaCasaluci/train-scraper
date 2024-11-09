import {VeichleTypeEnum, ServiceType, Denomination, TrainCategoryEnum} from "../../enums";

export class TrainJourney {
    id: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    status: string;
    trains: Train[];
    price?: Price;
}

export class Price {
    currency?: string | null;
    amount?: number | null;
    originalAmount?: number | null;
    indicative?: boolean | null;
}

export class Train {
    description: string;
    trainCategory: TrainCategoryEnum;
    acronym: string;
    denomination: Denomination;
    name: string;
    logoId: string;
    urban: boolean;
}

export class Grid {
    id: string;
    summaries: GridSummary[];
    selectedOfferId: string | null;
    selectedServiceId: string | null;
    services: Service[];
    infoMessages: string[];
    canShowSeatMap: boolean;
    collapsedVisualization: boolean;
    regional: boolean;
}

export class GridSummary {
    name: string;
    description: string;
    duration: string;
    highlightedMessage: string | null;
    urban: boolean;
    vehicleInfo: string | null;
    departureLocationName: string;
    arrivalLocationName: string;
    departureTime: string;
    arrivalTime: string;
    trainInfo: Train;
    bdoOrigin: string;
    showInfomobilityLink: boolean;
}

export class Service {
    id: number;
    name: ServiceType;
    shortName: string;
    groupName: string;
    description: string | null;
    descriptionStandard: string;
    offers: Offer[];
    minPrice?: Price | null;
    bestOfferId: string | null;
    extendedName: string | null;
    descriptionKey: string;
}

export class Offer {
    offerId: number;
    serviceId: number;
    serviceName: string;
    name: string;
    description: string;
    price?: Price;
    availableAmount: number;
    status: string;
    offerKeys: string[];
}

export class TicketSolution {
    solution: TrainJourney;
    grids: Grid[];
    messages: string[];
    co2Emission: CO2Emission;
    nextDaySolution: boolean;
}

export class CO2Emission {
    summaryTitle: string;
    summaryDescription: string;
    vehicleDetails: VehicleEmission[];
}

export class VehicleEmission {
    type: VeichleTypeEnum;
    kgEmissions: number;
}

export class TrainApiResponse {
    searchId: string;
    cartId: string;
    highlightedMessages: any[];
    solutions: TicketSolution[];
    minimumPrices: any[];
}
