/**
 * Helper functions for manage our features.
 */
#include <stdio.h>

#include "features.h"

void features_list(void)
{
    printf("Features: list:\n");
    printf("---------------------\n")
    printf("Use Display: ");
#if FEATURE_USE_DISPLAY
    printF("[ On ]\n");
#else
    printf("[ OFF \n]");
#endif
    printf("Show IPv6 on Start: ");
#if FEATURE_SHOW_IP_ON_START:
    printF("[ On ]\n");
#else
    printf("[ OFF \n]");
#endif
}
