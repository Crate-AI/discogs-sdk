import { basicAuthExample } from '../examples/auth/basic-auth.ts';
import { collectionExample } from '../examples/collection/collection-operations.ts';
import { searchExample } from '../examples/search/search-operations.ts';
import dotenv from 'dotenv';

dotenv.config();

function validateEnv() {
    if (!process.env.CONSUMER_KEY) {
        throw new Error('CONSUMER_KEY is required in .env file');
    }
    if (!process.env.CONSUMER_SECRET) {
        throw new Error('CONSUMER_SECRET is required in .env file');
    }
}

async function runExamples() {
    try {
        validateEnv();

        console.log('Running Auth Example:');
        const authenticatedSdk = await basicAuthExample();

        if (authenticatedSdk) {
            console.log('\nRunning Collection Example:');
            await collectionExample(authenticatedSdk);

            console.log('\nRunning Search Example:');
            await searchExample(authenticatedSdk);
        }

    } catch (error) {
        console.error('Example failed:', error);
        process.exit(1);
    }
}

runExamples().catch(console.error);