import { faker } from '@faker-js/faker';

export interface UserPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export const createUser = (overrides: Partial<UserPayload> = {}): UserPayload => ({
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12, memorable: false }),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    ...overrides,
});