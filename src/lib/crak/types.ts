export type CrakPerformerCharacteristic = {
  bodyTypes?: string[];
  country?: string;
  gender?: string;
  languages?: string[];
  bustSize?: string;
  ethnicities?: string[];
  eyeColor?: string;
  hairColor?: string;
  age?: number;
  height?: string;
  measurements?: string;
  weight?: string;
  zodiac?: string;
  pubicHair?: string;
  fetishes?: string[];
};

export type CrakPerformerI18n = {
  description?: string;
  expertise?: string;
  turnOns?: string;
  characteristic?: Record<string, unknown>;
};

export type CrakPerformer = {
  nameClean: string;
  name: string;
  itemId: string;
  live: boolean;
  score?: number;
  stars?: number;
  systemScore?: number;
  systemSource?: string;
  thumbnailUrl?: string;
  iframeFeedURL?: string;
  streamFeedUrl?: string;
  roomUrl?: string;
  liveSnapshotURL?: string;
  lastConnection?: string;
  createdDate?: string;
  updatedDate?: string;
  customTags?: string[];
  characteristicsTags?: string[];
  autoTags?: string[];
  characteristic?: CrakPerformerCharacteristic;
  i18n?: CrakPerformerI18n;
};

export type CrakPerformersResponse = {
  count: number;
  performers: CrakPerformer[];
};

export type CrakFetchParams = {
  page?: number;
  size?: number;
  sorting?: "score" | "mostRecent" | "alphabetical" | "topRated" | "random";
  gender?: "f" | "m" | "c" | "t";
  live?: boolean;
  tags?: string;
  ethnicities?: string;
  ages?: string;
  lang?: string;
  name?: string;
  brands?: string;
};
