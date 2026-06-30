import nextConfig from "eslint-config-next/core-web-vitals";
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";

const eslintConfig = [
  ...nextConfig,
  reactYouMightNotNeedAnEffect.configs.recommended,
];

export default eslintConfig;
