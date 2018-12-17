/**
 * Helper functions for manage our features.
 */
#include <stdio.h>

#include "features.h"
#include "net/gcoap.h"
#include "cbor.h"

extern void dumpbytes(const uint8_t *buf, size_t len);

void features_list(void)
{
    printf("Features: list:\n");
    printf("---------------------\n");
    printf("Use Display: ");
#if FEATURE_USE_DISPLAY
    printf("[ On ]\n");
#else
    printf("[ OFF \n]");
#endif
    printf("Show IPv6 on Start: ");
#if FEATURE_SHOW_IP_ON_START
    printf("[ On ]\n");
#else
    printf("[ OFF \n]");
#endif
}

void features_init(uint8_t *buf, size_t maxlen)
{
        /* Get all available features on this board */
    CborEncoder encoder;
    cbor_encoder_init(&encoder, buf, maxlen, 0);

    CborEncoder features;
    CborError err = cbor_encoder_create_map(&encoder, &features, 4);
    if (err != 0)
        printf("error: create map %d\n", err);

    /* set pwr_period */
    cbor_encode_text_stringz(&features, "pwr_period");
    cbor_encode_uint(&features, (uint64_t) 1000);

    /* set switch_state */
    cbor_encode_text_stringz(&features, "switch_state");
    cbor_encode_boolean(&features, false);

    /* set estop */
    cbor_encode_text_stringz(&features, "estop");
    cbor_encode_boolean(&features, false);

    /* set manual */
    cbor_encode_text_stringz(&features, "manual");
    cbor_encode_boolean(&features, false);

    err = cbor_encoder_close_container(&encoder, &features);
}
