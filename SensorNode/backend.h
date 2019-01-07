#ifndef BACKEND_H
#define BACKEND_H

#ifdef __cplusplus
extern "C" {
#endif

#define BACKEND_REG             "/new-device"  /**< Backend resource to register new devices */
#define BACKEND_CONFIG          "/config"      /**< Backend resource to set/change config */
#define BACKEND_SEND            "/measure"     /**< Backend resource to accept measurements */
#define BACKEND_PORT            "9900"         /**< Port the backend listens to */

#ifdef __cplusplus
}
#endif

#endif /* BACKEND_H */
/** @} */