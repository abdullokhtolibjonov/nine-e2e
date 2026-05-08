import { chromium, FullConfig } from '@playwright/test';
import { getLocalSecretsIfExists } from './src/helpers/getAwsParameters';
import * as fs from 'fs';
import * as path from 'path';
import { authenticateInCognito, authenticateInCore } from '@helpers/auth';

export default async function globalSetup(config: FullConfig) {
  const secrets = await getLocalSecretsIfExists();
  const cognito = {
    login: secrets.COGNITO_LOGIN,
    password: secrets.COGNITO_PASSWORD,
  }
  const users = [
    {
      role: 'admin',
      email: secrets.ADMIN_LOGIN,
      password: secrets.ADMIN_PASSWORD,
      file: '.auth/admin.json',
    },
    {
      role: 'publisher',
      email: secrets.PUBLISHER_LOGIN,
      password: secrets.PUBLISHER_PASSWORD,
      file: '.auth/publisher.json',
    },
    {
      role: 'agency',
      email: secrets.AGENCY_LOGIN,
      password: secrets.AGENCY_PASSWORD,
      file: '.auth/agency.json',
    },
    {
      role: 'advertiser',
      email: secrets.ADVERTISER_LOGIN,
      password: secrets.ADVERTISER_PASSWORD,
      file: '.auth/advertiser.json',
    },
    {
      role: 'advertiser2',
      email: secrets.ADVERTISER2_LOGIN,
      password: secrets.ADVERTISER2_PASSWORD,
      file: '.auth/advertiser2.json',
    },
  ];

  const browser = await chromium.launch({ headless: false });

  await Promise.all(
    users.map(async (user) => {
      console.log(`Authenticating as ${user.role}...`);
      const context = await browser.newContext();
      const page = await context.newPage();

      await authenticateInCognito(page, cognito.login, cognito.password, secrets.BASE_URL);
      await authenticateInCore(page, user.email, user.password, `${secrets.BASE_URL}/login`);

      fs.mkdirSync(path.dirname(user.file), { recursive: true });
      await context.storageState({ path: user.file });
      await context.clearCookies();
      await context.close();

      console.log(`Session saved: ${user.file}`);
    })
  );

  await browser.close();
}
