const { version } = require('../package.json');

const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.template`;

const TEMPLATE_TARO = 'template-taro';

const TEMPLATE_ANT_DESIGN_PRO = 'template-ant-design-pro';

module.exports = {
  version,
  downloadDirectory,
  TEMPLATE_TARO,
  TEMPLATE_ANT_DESIGN_PRO,
};
