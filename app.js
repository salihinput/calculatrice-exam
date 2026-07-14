const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn-calc");
let expression = "";
const operators = ["+", "-", "*", "/"];

function isOperator(value) {
  return operators.includes(value);
}

function formatExpression(value) {
  if (!value) {
    return "0";
  }

  const parts = value.split(/([+\-*/])/);

  return parts
    .map((part) => {
      if (/^[+\-*/]$/.test(part)) {
        return part;
      }

      if (part === "") {
        return "";
      }

      const normalized = part.replace(/,/g, ".");
      const [integerPart, decimalPart] = normalized.split(".");
      const formattedInteger = Number(integerPart).toLocaleString("fr-FR");

      return decimalPart !== undefined
        ? `${formattedInteger},${decimalPart}`
        : formattedInteger;
    })
    .join("");
}

function updateDisplay(value) {
  display.textContent = value;
}

function appendToDisplay(value) {
  if (display.textContent === "ERREUR") {
    expression = "";
    updateDisplay("0");
  }

  if (expression === "" && isOperator(value)) {
    return;
  }

  if (expression === "0" && !isOperator(value)) {
    expression = "";
  }

  const lastChar = expression.slice(-1);
  if (isOperator(lastChar) && isOperator(value)) {
    expression = expression.slice(0, -1) + value;
    updateDisplay(formatExpression(expression));
    return;
  }

  if (value === ",") {
    const currentNumber = expression.split(/[+\-*/]/).pop();
    if (currentNumber.includes(".")) {
      return;
    }
    expression += ".";
  } else {
    expression += value;
  }

  updateDisplay(formatExpression(expression));
}

function clearDisplay() {
  expression = "";
  updateDisplay("0");
}

function calculate() {
  if (!expression) {
    updateDisplay("0");
    return;
  }

  try {
    const sanitizedExpression = expression.replace(/[^0-9+\-*/.]/g, "");

    if (!sanitizedExpression) {
      throw new Error("Expression vide");
    }

    if (
      /[+\-*/]$/.test(sanitizedExpression) ||
      sanitizedExpression.includes("//") ||
      sanitizedExpression.includes("**")
    ) {
      throw new Error("Expression invalide");
    }

    const result = Function(
      '"use strict"; return (' + sanitizedExpression + ")",
    )();

    if (!Number.isFinite(result)) {
      throw new Error("Erreur");
    }

    expression = String(result);
    updateDisplay(formatExpression(expression));
  } catch (error) {
    expression = "";
    updateDisplay("ERREUR");
  }
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;

    if (button.id === "clearBtn") {
      clearDisplay();
    } else if (button.id === "equalsBtn") {
      calculate();
    } else if (value) {
      appendToDisplay(value);
    }
  });
});
