const axios = require('axios');
const ora = require('ora');
const Inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { promisify } = require('util');
let { ncp } = require('ncp');
let downloadGitRepo = require('download-git-repo');
const { MetalSmith } = require('metalsmith');
let { render } = require('consolidate').ejs;

render = promisify(render);
ncp = promisify(ncp);
downloadGitRepo = promisify(downloadGitRepo);

const { downloadDirectory } = require('./constants');
// TODO 拉取项目模版 获取对应版本号

// 获取项目仓库列表
const fetchRepoList = async () => {
  const { data } = await axios.get('https://api.github.com/users/Bravo123/repos');
  return data;
};

// 获取仓库的tags
const fetchTagList = async (repo) => {
  const { data } = await axios.get(`https://api.github.com/repos/Bravo123/${repo}/tags`);
  return data;
};

// loading方法
const loadingFn = (fn, message) => async (...args) => {
  const spinner = ora(message);
  spinner.start();
  const result = await fn(...args);
  spinner.succeed();
  return result;
};

// 下载git项目
const download = async (repo, tag) => {
  let api = `Bravo123/${repo}`;
  if (tag) {
    api += `#${tag}`;
  }
  const dest = `${downloadDirectory}/${repo}`;
  await downloadGitRepo(api, dest);
  return dest;
};

module.exports = async (projectName) => {
  if (fs.existsSync(path.join(path.resolve(), projectName))) {
    console.log(chalk.red('项目已存在，请自行重新安装！'));
    return;
  }
  let repos = await loadingFn(fetchRepoList, 'fetching repos')();
  repos = repos.map((item) => item.name);
  // 选模版
  const { repo } = await Inquirer.prompt({
    name: 'repo', // 获取选择后的结果
    type: 'list',
    message: 'choose a template to create project',
    choices: repos,
  });
  // 选版本号
  let tags = await loadingFn(fetchTagList, 'fetching tags')(repo);
  tags = tags.map((item) => item.name);
  const { tag } = await Inquirer.prompt({
    name: 'tag', // 获取选择后的结果
    type: 'list',
    message: 'choose a tag to create project',
    choices: tags,
  });

  // download-git-rtrp
  // 下载到~/.template
  const result = await loadingFn(download, 'download template')(repo, tag);
  await ncp(result, path.resolve(projectName));
  // if (!fs.existsSync(path.join(result, 'ask.js'))) {
  //   // 拷贝到当前目录
  //   await ncp(result, path.resolve(projectName));
  // } else {
  //   await new Promise((resolve, reject) => {
  //     MetalSmith(__dirname)
  //       .sourse(result)
  //       .destination(path.resolve(projectName(projectName)))
  //       .use(async (files, metal, done) => {
  //         const args = require(path.join(result, 'ask.js'));
  //         const res = Inquirer.prompt(args);
  //         const meta = metal.metadata();
  //         Object.assign(meta, res);
  //         delete files['ask.js'];
  //         done();
  //       })
  //       .use((files, metal, done) => {
  //         const obj = metal.metadata();
  //         Reflect.ownKeys(files).forEach(async (file) => {
  //           if (file.includes('js') || file.includes('json')) {
  //             let content = files[file].contents.toString();
  //             if (content.includes('<%')) {
  //               content = await render(content, obj);
  //               files[file].contents = Buffer.from(content);
  //             }
  //           }
  //         });
  //         done();
  //       })
  //       .build((err) => {
  //         if (err) {
  //           reject(err);
  //         } else {
  //           resolve();
  //         }
  //       });
  //   });
  // }
};
