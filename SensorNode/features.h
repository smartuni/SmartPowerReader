/**
 * @ingroup     features
 *
 * @{
 *
 * @brief       Manages different features.
 *
 * @author      René Herthel <rene.herthel@haw-hamburg.de>
 */

#ifndef FEATURES_H
#define FEATURES_H

#ifdef __cplusplus
extern "C" {
#endif

#include "cbor.h"

/* Globaly enable/disable display functionality. */
#define FEATURE_USE_DISPLAY (0)
/* Can only be used with a display */
#define FEATURE_SHOW_IP_ON_START (0 && FEATURE_USE_DISPLAY)
/* Turn on and off using buttons. */
#define FEATURE_USE_BUTTONS (1)

/**
 * NOTE: Not implemented or functional yet! [Optional]
 */
/*
void features_list(void);
*/

/**
 * @brief   writes available features on the board
 *          to be sent to base station
 *
 * @param   buffer to be used as payload in registration
 * @param   size of @p buf
 */
void features_init(uint8_t *buf, size_t maxlen);

#ifdef __cplusplus
}
#endif

#endif /* FEATURES_H */
/** @} */
