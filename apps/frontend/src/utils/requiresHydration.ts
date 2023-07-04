/* eslint-disable no-underscore-dangle */
export const requiresHydration = () =>
  !!(window as { __REQUIRE_HYDRATION__?: boolean }).__REQUIRE_HYDRATION__;
