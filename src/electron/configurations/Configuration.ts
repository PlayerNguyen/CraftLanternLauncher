import fs from "fs";
import { getConfigPath } from "../AssetResolver";

interface Configuration {
  /**
   * Get a configuration
   * @param value a value to get
   * @returns an object from configuration
   */
  get(value: string): object | undefined;

  /**
   *
   * @param value an value as a key to set
   * @param object an object to set
   */
  set(value: string, object: object): void;

  /**
   * Check if the configuration has value params
   * @param value a string key to determine value
   */
  has(value: string): boolean;
}

class MemoryConfiguration implements Configuration {
  map: Map<string, object>;

  constructor(configMap: Map<string, object> | undefined) {
    this.map = configMap ? configMap : new Map<string, object>();
  }

  get(value: string): object | undefined {
    return this.map.get(value);
  }

  set(value: string, object: object) {
    return this.map.set(value, object);
  }

  has(value: string): boolean {
    return this.map.has(value);
  }

  toJson(): string {
    return JSON.stringify(Object.fromEntries(this.map));
  }

  public static fromJson(jsonText: string): MemoryConfiguration {
    const parsedObject: object = JSON.parse(jsonText);
    return new MemoryConfiguration(new Map(Object.entries(parsedObject)));
  }
}

class ConfigurationStatic {
  private static memoryConfiguration: MemoryConfiguration;

  public static getMemoryConfiguration(): MemoryConfiguration {
    if (!this.memoryConfiguration) {
      // Whether contains the file, read data from it
      if (this.hasConfigFile()) {
        this.memoryConfiguration = MemoryConfiguration.fromJson(
          fs.readFileSync(getConfigPath(), "utf-8")
        );
      } else {
        // Otherwise, load a default configuration and store
        this.memoryConfiguration = new MemoryConfiguration(
          new Map(Object.entries(DefaultConfiguration))
        );

        console.log(this.memoryConfiguration);

        // Then save config into disk
        this.saveConfigFile();
      }
    }
    return this.memoryConfiguration;
  }

  private static saveConfigFile(): void {
    fs.writeFileSync(getConfigPath(), this.memoryConfiguration.toJson(), {
      flag: "a",
    });
  }

  private static hasConfigFile(): boolean {
    return fs.existsSync(getConfigPath());
  }
}

const DefaultConfiguration: object = {
  CheckForUpdate: true,
};

export { Configuration, MemoryConfiguration, ConfigurationStatic };
