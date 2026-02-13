export type ErrorCode =
  | "UpdateKpiNotFoundError"
  | "RemoveKpiNotFoundError"
  | "RecordKpiMeasurementKpiNotFoundError"
  | "SetKpiStatusNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateKpiNotFoundError extends Error implements ReducerError {
  errorCode = "UpdateKpiNotFoundError" as ErrorCode;
  constructor(message = "UpdateKpiNotFoundError") {
    super(message);
  }
}

export class RemoveKpiNotFoundError extends Error implements ReducerError {
  errorCode = "RemoveKpiNotFoundError" as ErrorCode;
  constructor(message = "RemoveKpiNotFoundError") {
    super(message);
  }
}

export class RecordKpiMeasurementKpiNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RecordKpiMeasurementKpiNotFoundError" as ErrorCode;
  constructor(message = "RecordKpiMeasurementKpiNotFoundError") {
    super(message);
  }
}

export class SetKpiStatusNotFoundError extends Error implements ReducerError {
  errorCode = "SetKpiStatusNotFoundError" as ErrorCode;
  constructor(message = "SetKpiStatusNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateKpi: { UpdateKpiNotFoundError },
  RemoveKpi: { RemoveKpiNotFoundError },
  RecordKpiMeasurement: { RecordKpiMeasurementKpiNotFoundError },
  SetKpiStatus: { SetKpiStatusNotFoundError },
};
