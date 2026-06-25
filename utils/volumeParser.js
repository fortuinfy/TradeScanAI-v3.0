// =========================
// VOLUME PARSER
// =========================

function parseVolume(volumeInput) {

  if (

    volumeInput === undefined ||

    volumeInput === null

  ) {

    return 0;

  }

  const value = volumeInput

    .toString()

    .trim()

    .toUpperCase()

    .replace(/\s+/g, "");

  if (value === "") {

    return 0;

  }

  // =========================
  // CRORE
  // =========================

  if (value.includes("CR")) {

    return (

      parseFloat(

        value.replace("CR", "")

      ) * 10000000

    );

  }

  // =========================
  // LAKH
  // =========================

  if (value.includes("L")) {

    return (

      parseFloat(

        value.replace("L", "")

      ) * 100000

    );

  }

  // =========================
  // MILLION
  // =========================

  if (value.includes("M")) {

    return (

      parseFloat(

        value.replace("M", "")

      ) * 1000000

    );

  }

  // =========================
  // THOUSAND
  // =========================

  if (value.includes("K")) {

    return (

      parseFloat(

        value.replace("K", "")

      ) * 1000

    );

  }

  return parseFloat(value) || 0;

}
