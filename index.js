const fs = require("fs");
const csvParser = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const XLSX = require("xlsx");

// Replace this with the actual exchange rate for USD to KRW
const exchangeRateUSDToKRW = 1282.54;

// Replace 'input.csv' with the path to your Shopify product export CSV file
const inputFilePath = "products_export_1.csv";

const convertToKRW = (usdPrice) => {
  const krwPrice = usdPrice * exchangeRateUSDToKRW;
  console.log("usdPrice", usdPrice);
  const roundedKRW = Math.ceil(krwPrice / 5000) * 5000;
  const finalKrwPrice = roundedKRW.toFixed(2);
  console.log("krwPrice", finalKrwPrice);
  return finalKrwPrice;
};

const replaceUnderscoreWithDash = (str) => {
  return str.replaceAll("_", "-"); // Use replaceAll to replace all occurrences
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
  return `products_export_${timestamp}`;
};

const convertPrices = async () => {
  try {
    const csvRows = [];
    const headers = [];

    fs.createReadStream(inputFilePath)
      .pipe(csvParser())
      .on("headers", (parsedHeaders) => {
        headers.push(...parsedHeaders);
      })
      .on("data", (row) => {
        csvRows.push(row);
      })
      .on("end", async () => {
        csvRows.forEach((row) => {
          // Check if product price is defined and convert
          if (row["Price"] !== undefined) {
            console.log('original row["Price"]', row["Price"]);
            const price = parseFloat(row["Price"]);
            if (!isNaN(price)) {
              row["Price"] = convertToKRW(price);
            } else {
              console.warn(
                `Invalid price for Product ID ${row["Product ID"]}. Skipping.`,
              );
              delete row["Price"];
            }
          }

          // Check if variant price is defined and convert
          if (row["Variant Price"] !== undefined) {
            const variantPrice = parseFloat(row["Variant Price"]);
            if (!isNaN(variantPrice)) {
              row["Variant Price"] = convertToKRW(variantPrice);
            } else {
              console.warn(
                `Invalid variant price for Product ID ${row["Product ID"]}. Skipping.`,
              );
              delete row["Variant Price"];
            }
          }

          // Check if cost per item is defined and convert
          if (row["Cost per item"] !== undefined) {
            const costPerItem = parseFloat(row["Cost per item"]);
            if (!isNaN(costPerItem)) {
              row["Cost per item"] = convertToKRW(costPerItem);
            } else {
              console.warn(
                `Invalid cost per item for Product ID ${row["Product ID"]}. Skipping.`,
              );
              delete row["Cost per item"];
            }
          }

          // Replace underscores with dashes in Variant SKU if it exists
          if (row["Variant SKU"]) {
            row["Variant SKU"] = replaceUnderscoreWithDash(row["Variant SKU"]);
          }
        });

        const outputFilename = generateExportFilename();

        // Write the CSV file
        const csvOutputFilePath = `${outputFilename}.csv`;
        const csvWriter = createCsvWriter({
          path: csvOutputFilePath,
          header: headers.map((header) => ({ id: header, title: header })),
        });
        await csvWriter.writeRecords(csvRows);

        console.log(
          `Conversion completed. Exported CSV to: ${csvOutputFilePath}`,
        );

        // Write the XLSX file
        const xlsxOutputFilePath = `${outputFilename}.xlsx`;
        const worksheet = XLSX.utils.json_to_sheet(csvRows, {
          header: headers,
        });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, xlsxOutputFilePath);

        console.log(
          `Conversion completed. Exported XLSX to: ${xlsxOutputFilePath}`,
        );
      });
  } catch (error) {
    console.error("Error:", error.message);
  }
};

convertPrices();
