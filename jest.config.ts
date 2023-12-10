import { getJestProjects } from '@nx/jest';

// We set the timezone be UTC so we have consistency with our tests, no matter where we run them.
process.env.TZ = 'UTC';

export default {
    projects: getJestProjects(),
};
