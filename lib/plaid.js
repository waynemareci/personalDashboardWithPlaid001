import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';

const environment = process.env.PLAID_ENV === 'production' 
  ? PlaidEnvironments.production 
  : PlaidEnvironments.sandbox;

const configuration = new Configuration({
  basePath: environment,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);