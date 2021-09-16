# GetGist

有时候，突然觉得新建仓库来保存一些模板代码有点麻烦。  
于是乎，又一个想法，把代码片段保存在 gist 上，需要的时候下载下来就好了。  
但是，我没有在 GitHub 官方的 [gh](https://cli.github.com/) 命令里面找到可以下载 gist 的命令。  
这需求，有点小众，自己也不一定经常用。但还是试着玩一下写个命令行工具吧。

## Usage

```
Usage: getgist [options] [command]

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  login [token]
  logout
  get
  help [command]  display help for command
```
  