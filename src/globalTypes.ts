export type PresetDataKey = `${number}_${"1" | "2" | "0"}`;

export type PresetDataTypes = Record<PresetDataKey, "text" | "img">;

export type PresetDataTexts = Record<PresetDataKey, string>;

export type ReceivedFile = {
    fieldname: PresetDataKey;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
}