const API_URL = "https://economia.awesomeapi.com.br/last/USD-BRL";
const formatters = {
	USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
	BRL: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
};
const amountFormatters = {
	USD: new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
	BRL: new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
};
const currencySymbols = { USD: "US$", BRL: "R$" };

const form = document.querySelector("#converter-form");
const amountInput = document.querySelector("#amount");
const result = document.querySelector("#result");
const resultDetail = document.querySelector("#result-detail");
const rateDisplay = document.querySelector("#rate-display");
const rateStatus = document.querySelector("#rate-status");
const statusDot = document.querySelector("#status-dot");
const errorMessage = document.querySelector("#error-message");
const swapButton = document.querySelector("#swap-button");
const fromSymbol = document.querySelector("#from-symbol");
const fromCode = document.querySelector("#from-code");
const toSymbol = document.querySelector("#to-symbol");
const toCode = document.querySelector("#to-code");
const resultTitle = document.querySelector("#result-title");
const resultCode = document.querySelector("#result-code");
const rateEquivalence = document.querySelector("#rate-equivalence");

let dollarRate = null;
let fromCurrency = "USD";
let toCurrency = "BRL";

function showError(message) {
	errorMessage.textContent = message;
	errorMessage.hidden = false;
}

function clearError() {
	errorMessage.textContent = "";
	errorMessage.hidden = true;
}

async function loadRate() {
	try {
		const response = await fetch(API_URL);
		if (!response.ok) throw new Error("Falha na resposta da API");

		const data = await response.json();
		const rate = Number.parseFloat(data.USDBRL?.bid);
		if (!Number.isFinite(rate)) throw new Error("Cotação indisponível");

		dollarRate = rate;
		rateDisplay.textContent = formatters.BRL.format(rate);
		rateStatus.textContent = "Cotação atual do dólar";
		statusDot.classList.add("loaded");
		updateRateEquivalence();
	} catch {
		rateStatus.textContent = "Não foi possível atualizar";
		statusDot.classList.add("error");
		showError("Não foi possível carregar a cotação. Tente novamente.");
	}
}

function updateRateEquivalence() {
	if (dollarRate === null) return;
	const rate = fromCurrency === "USD" ? dollarRate : 1 / dollarRate;
	rateEquivalence.textContent = formatters[toCurrency].format(rate);
	resultTitle.textContent = `1 ${fromCurrency === "USD" ? "dólar" : "real"} equivale a`;
	resultCode.textContent = toCurrency;
}

function updateCurrencyLabels() {
	fromSymbol.textContent = currencySymbols[fromCurrency];
	fromCode.textContent = fromCurrency;
	toSymbol.textContent = currencySymbols[toCurrency];
	toCode.textContent = toCurrency;
	amountInput.value = "";
	result.textContent = "0,00";
	resultDetail.textContent = "Digite um valor para começar";
	updateRateEquivalence();
}

swapButton.addEventListener("click", () => {
	[fromCurrency, toCurrency] = [toCurrency, fromCurrency];
	clearError();
	updateCurrencyLabels();
	amountInput.focus();
});

form.addEventListener("submit", (event) => {
	event.preventDefault();
	clearError();

	const amount = Number.parseFloat(amountInput.value);
	if (!Number.isFinite(amount) || amount < 0) {
		showError(`Digite um valor válido em ${fromCurrency === "USD" ? "dólar" : "real"}.`);
		amountInput.focus();
		return;
	}
	if (dollarRate === null) {
		showError("Aguarde a cotação ser carregada e tente novamente.");
		return;
	}

	const convertedAmount = fromCurrency === "USD" ? amount * dollarRate : amount / dollarRate;
	result.textContent = amountFormatters[toCurrency].format(convertedAmount);
	resultDetail.textContent = `${formatters[fromCurrency].format(amount)} = ${formatters[toCurrency].format(convertedAmount)}`;
});

loadRate();
