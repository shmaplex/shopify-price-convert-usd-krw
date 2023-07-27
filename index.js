const fs = require("fs");
const csv = require("fast-csv");

// Replace this with the actual exchange rate for USD to KRW
const exchangeRateUSDToKRW = 1279.88;

// Replace 'input.csv' with the path to your Shopify product export CSV file
const inputFilePath = "products_export_1.csv";
// Replace 'output.csv' with the desired output path
const outputFilePath = "products_export_converted.csv";

const convertToKRW = (usdPrice) => {
  return (usdPrice * exchangeRateUSDToKRW).toFixed(2);
};

/**
 * This handles replacing the _ (underscore) in the SKU with - (dashes)
 * @param {*} str
 * @returns
 */
const replaceUnderscoreWithDash = (str) => {
  return str.replace(/_/g, "-");
};

const generateExportFilename = () => {
  const now = new Date();
  const options = {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const timestamp = now
    .toLocaleString("en-US", options)
    .replace(/[/,:\s]/g, "-")
    .replace(/--/g, "-");
  return `output_${timestamp}.csv`;
};

const convertPrices = () => {
  const outputFilePath = generateExportFilename();
  const inputStream = fs.createReadStream(inputFilePath);
  const outputStream = fs.createWriteStream(outputFilePath);

  const csvStream = csv
    .parse({ headers: true })
    .transform((row) => {
      row["Price"] = convertToKRW(parseFloat(row["Price"]));

      // Convert variant price if it exists
      if (row["Variant Price"]) {
        row["Variant Price"] = convertToKRW(parseFloat(row["Variant Price"]));
      }

      // Replace underscores with dashes in Variant SKU if it exists
      if (row["Variant SKU"]) {
        row["Variant SKU"] = replaceUnderscoreWithDash(row["Variant SKU"]);
      }

      return row;
    })
    .on("error", (error) => console.error(error))
    .pipe(csv.format({ headers: true }))
    .pipe(outputStream);

  inputStream.pipe(csvStream);

  outputStream.on("finish", () => {
    console.log(`Conversion completed. Exported to: ${outputFilePath}`);
  });
};

convertPrices();
