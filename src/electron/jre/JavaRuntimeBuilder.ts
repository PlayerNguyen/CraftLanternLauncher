import needle from "needle";

export interface AdoptiumAvailableRuntimeResponse {
  available_lts_releases: [number];
  available_releases: [number];

  most_recent_feature_release: number;
  most_recent_feature_version: number;
  most_recent_lts: number;
  tip_version: number;
}

export async function getAdoptiumAvailableRuntimeItems(): Promise<AdoptiumAvailableRuntimeResponse> {
  let _response = (
    await needle("get", `https://api.adoptium.net/v3/info/available_releases`, {
      json: true,
    })
  ).body;

  return _response;
}


