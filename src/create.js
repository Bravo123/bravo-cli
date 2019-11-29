const axios = require('axios');
const ora = require('ora');
const Inquirer = require('inquirer');
// TODO 拉取项目模版 选版本号

// 获取项目仓库列表
const fetchRepoList = async () => {
  const { data } = await axios.get('https://api.github.com/users/Bravo123/repos');
  return data;
};

module.exports = async (projectName) => {
  // console.log(projectName);

  const spinner = ora('fetching template ....');
  spinner.start();
  let repos = await fetchRepoList();
  repos = repos.map((item) => item.name);
  spinner.succeed();
  console.log(repos);
  const { repo } = await Inquirer.prompt({
    name: 'repo', // 获取选择后的结果
    type: 'list',
    message: 'choose a template to create project',
    choices: repos,
  });
  console.log(repo);
  // loading
};
