"use strict";
// @ts-check

const booleanPointInPolygon = require("@turf/boolean-point-in-polygon").default;

const findElectorate = (features, point) => {
  for (const feat of features) {
    if (booleanPointInPolygon(point, feat.geometry)) {
      return feat.properties.Elect_div;
    }
  }

  return undefined;
};

const processGeoLocation = (geojson, dbData) => {
  console.log("starting");

  console.log(geojson.features.length); // 151 complex geometries
  console.log(dbData.rows.length); // >15K tweets

  const t0 = performance.now();
  const tweets = [];

  for (const { key, value: point } of dbData.rows) {
    const electorate = findElectorate(geojson.features, point);

    if (electorate !== undefined) {
      tweets.push({
        key,
        point,
        electorate,
      });
    }
  }

  const t1 = performance.now();
  console.log(t1 - t0);
  console.log("done");
  return tweets;
};

module.exports = processGeoLocation;
