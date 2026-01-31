const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable external modules to prevent ENOENT errors
config.resolver.unstable_enablePackageExports = false;

// Exclude node: protocol modules
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName.startsWith('node:')) {
        // Return an empty module for node: imports
        return {
            type: 'empty',
        };
    }

    // Default resolution
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
