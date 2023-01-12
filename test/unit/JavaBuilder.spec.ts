import { expect } from "chai";
import { getAdoptiumAvailableRuntimeItems } from "../../src/electron/jre/JavaRuntimeBuilder";

describe("Get JDK from Adoptium API", () => {
  it("response a version object", async function () {
    this.timeout(10000);
    let runtimeList = await getAdoptiumAvailableRuntimeItems();
    expect(runtimeList).not.to.be.null;
    expect(runtimeList.available_lts_releases).to.be.instanceOf(Array);
    expect(runtimeList.available_releases).to.be.instanceOf(Array);

    expect(typeof runtimeList.most_recent_feature_release).to.eq("number");
    expect(typeof runtimeList.most_recent_feature_version).to.eq("number");

    expect(typeof runtimeList.most_recent_lts).to.eq("number");

    expect(typeof runtimeList.tip_version).to.be.eq("number");
  });
});
