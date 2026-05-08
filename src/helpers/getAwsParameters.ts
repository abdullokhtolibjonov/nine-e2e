import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';
import { fromIni, fromInstanceMetadata } from '@aws-sdk/credential-providers';
import * as fs from 'fs';
import * as path from 'path';

export interface AwsSecrets {
  BASE_URL: string;
  //API_URL: string;
  COGNITO_LOGIN: string;
  COGNITO_PASSWORD: string;
  ADMIN_LOGIN: string;
  ADMIN_PASSWORD: string;
  PUBLISHER_LOGIN: string;
  PUBLISHER_PASSWORD: string;
  AGENCY_LOGIN: string;
  AGENCY_PASSWORD: string;
  ADVERTISER_LOGIN: string;
  ADVERTISER_PASSWORD: string;
  ADVERTISER2_LOGIN: string;
  ADVERTISER2_PASSWORD: string;
}

const project = process.env.project ?? 'nin';
const env = process.env.env ?? 'stage';
const basePath = `/DA/automation-tests/${project}/${env}`;

const awsParameters = [
  `${basePath}/BASE_URL`,
  //`${basePath}/API_URL`,
  `${basePath}/COGNITO_LOGIN`,
  `${basePath}/COGNITO_PASSWORD`,
  `${basePath}/ADMIN_LOGIN`,
  `${basePath}/ADMIN_PASSWORD`,
  `${basePath}/PUBLISHER_LOGIN`,
  `${basePath}/PUBLISHER_PASSWORD`,
  `${basePath}/AGENCY_LOGIN`,
  `${basePath}/AGENCY_PASSWORD`,
  `${basePath}/ADVERTISER_LOGIN`,
  `${basePath}/ADVERTISER_PASSWORD`,
  `${basePath}/ADVERTISER2_LOGIN`,
  `${basePath}/ADVERTISER2_PASSWORD`,
];

export async function getAwsParameters(): Promise<Record<string, string>> {
  const localConfig = {
    region: 'eu-central-1',
    credentials: fromIni({
      profile: '297758177186_da-demo-stage-uat',
      clientConfig: { region: 'eu-central-1' },
    }),
  };

  const jenkinsConfig = {
    region: 'eu-central-1',
    credentials: fromInstanceMetadata(),
  };

  const client = new SSMClient(process.env.ci ? jenkinsConfig : localConfig);
  const secrets: Record<string, string> = {};

  try {
    for (const parameter of awsParameters) {
      const command = new GetParametersCommand({
        Names: [parameter],
        WithDecryption: true,
      });
      const result = await client.send(command);
      console.log(`Retrieved parameter: ${parameter}`);

      if (result.Parameters?.[0]?.Value) {
        secrets[parameter] = result.Parameters[0].Value;
      }
    }

    const secretsPath = path.join(process.cwd(), 'awsSecrets.json');
    fs.writeFileSync(secretsPath, JSON.stringify(secrets, null, 2));
    console.info('Retrieved and saved credentials from AWS Parameter Store!');

    return secrets;
  } catch (error) {
    console.error('Error retrieving AWS parameters:', error);
    process.exit(1);
  }
}

export async function getLocalSecretsIfExists(): Promise<AwsSecrets> {
  const secretFilePath = 'awsSecrets.json';
  let secrets: Record<string, string>;

  if (!fs.existsSync(secretFilePath)) {
    console.info('AWS secrets file not found. Retrieving from Parameter Store...');
    secrets = await getAwsParameters();
  } else {
    console.info('Using existing AWS secrets file');
    secrets = JSON.parse(fs.readFileSync(secretFilePath, 'utf-8'));
  }

  const base = `/DA/automation-tests/${project}/${env}`;

  const params: AwsSecrets = {
    BASE_URL: secrets[`${base}/BASE_URL`],
    //API_URL: secrets[`${base}/API_URL`],
    COGNITO_LOGIN: secrets[`${base}/COGNITO_LOGIN`],
    COGNITO_PASSWORD: secrets[`${base}/COGNITO_PASSWORD`],
    ADMIN_LOGIN: secrets[`${base}/ADMIN_LOGIN`],
    ADMIN_PASSWORD: secrets[`${base}/ADMIN_PASSWORD`],
    PUBLISHER_LOGIN: secrets[`${base}/PUBLISHER_LOGIN`],
    PUBLISHER_PASSWORD: secrets[`${base}/PUBLISHER_PASSWORD`],
    AGENCY_LOGIN: secrets[`${base}/AGENCY_LOGIN`],
    AGENCY_PASSWORD: secrets[`${base}/AGENCY_PASSWORD`],
    ADVERTISER_LOGIN: secrets[`${base}/ADVERTISER_LOGIN`],
    ADVERTISER_PASSWORD: secrets[`${base}/ADVERTISER_PASSWORD`],
    ADVERTISER2_LOGIN: secrets[`${base}/ADVERTISER2_LOGIN`],
    ADVERTISER2_PASSWORD: secrets[`${base}/ADVERTISER2_PASSWORD`],
  };

  Object.entries(params).forEach(([key, value]) => {
    if (!value) {
      console.error(`Missing required parameter: ${key}`);
      process.exit(1);
    }
  });

  return params;
}
