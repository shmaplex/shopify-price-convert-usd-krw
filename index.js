const fs = require('fs');
const csv = require('fast-csv');

// Replace this with the actual exchange rate for USD to KRW
const exchangeRateUSDToKRW = 1279.88;

// Replace 'input.csv' with the path to your Shopify product export CSV file
const inputFilePath = 'products_export_1.csv';
// Replace 'output.csv' with the desired output path
const outputFilePath = 'products_export_converted.csv';

const convertToKRW = (usdPrice) => {
  return (usdPrice * exchangeRateUSDToKRW).toFixed(2);
};

const convertPrices = () => {
  const inputStream = fs.createReadStream(inputFilePath);
  const outputStream = fs.createWriteStream(outputFilePath);

  const csvStream = csv
    .parse({ headers: true })
    .transform((row) => {
      row['Price'] = convertToKRW(parseFloat(row['Price']));


      // Convert variant price if it exists
      if (row['Variant Price']) {
        row['Variant Price'] = convertToKRW(parseFloat(row['Variant Price']));
      }

      return row;
    })
    .on('error', (error) => console.error(error))
    .pipe(csv.format({ headers: true }))
    .pipe(outputStream);

  inputStream.pipe(csvStream);
};

convertPrices();