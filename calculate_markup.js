/**
 * Usage:
 *
 * node calculate_markup.js
 *
 * The script will prompt you to enter the cost of each item in USD, the retail price of each item in USD,
 * and the quantity of products. After providing the input, the script will calculate the markup amount needed
 * per unit in USD to achieve the desired profit margin after accounting for the cost of each item, shipping,
 * and customs charges, considering the given quantity of products.
 *
 * Please provide valid positive numbers for cost, retail price, and quantity as requested by the prompt.
 * The script will then display the calculated markup per unit in USD.
 */

const readline = require("readline");

// Create an interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Given fixed data for the shipment
const shippingCostUSD = 461.65; // Shipping cost for the entire shipment in USD
const customsTaxUSD = 200.7; // Customs tax for the entire shipment in USD
const desiredProfitMargin = 0.4; // 40% profit margin

// Function to calculate the adjusted price per unit
const calculateAdjustedPrice = (currentPriceUSD, quantity) => {
  // Calculate the total offset needed to cover the additional charges for the entire shipment
  const totalAdditionalChargesUSD = shippingCostUSD + customsTaxUSD;

  // Calculate the additional charges per unit
  const additionalChargesPerUnitUSD = totalAdditionalChargesUSD / quantity;

  // Calculate the adjusted price per unit
  const adjustedPricePerUnitUSD = currentPriceUSD + additionalChargesPerUnitUSD;

  return adjustedPricePerUnitUSD.toFixed(2);
};

// Prompt the user to enter the current price of the product in USD that needs to be offset
rl.question(
  "Enter the current price of the product in USD that you need to offset: ",
  (currentPriceUSD) => {
    rl.question("Enter the quantity of products in the order: ", (quantity) => {
      rl.close();

      // Parse user inputs to numbers
      currentPriceUSD = parseFloat(currentPriceUSD);
      quantity = parseInt(quantity);

      // Check if the inputs are valid numbers
      if (
        isNaN(currentPriceUSD) ||
        isNaN(quantity) ||
        currentPriceUSD <= 0 ||
        quantity <= 0
      ) {
        console.error(
          "Invalid input. Please provide valid positive numbers for the current price and quantity of products.",
        );
      } else {
        const adjustedPricePerUnitUSD = calculateAdjustedPrice(
          currentPriceUSD,
          quantity,
        );
        console.log(`Adjusted Price Per Unit: $${adjustedPricePerUnitUSD} USD`);
      }
    });
  },
);
