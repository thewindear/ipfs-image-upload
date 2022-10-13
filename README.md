# 利用web3.storage网站提供接口功能上传IPFS

# 使用教程 

在项目上新建.env文件 添加以下内容

```
DELOPY_API_TOKEN=部署的web3.storage对应的api token
VITE_UPLOAD_API_TOKEN=上传文件使用的web3.storage对应的api token
``` 

# 静态网页自动化部署
> 推送main分支后自动部署IPFS
> 
> Fork 后 添加 仓库的 `secret.DELOPY_API_TOKEN`  和 `secret.VITE_UPLOAD_API_TOKEN`  两个密钥
> 
> 注意查看：github actions 中 Upload to IPFS 步骤 返回的前端地址

# 命令
* yarn build  构建静态文件
* yarn delopy 部署

# 其他

使用在线版 https://tourl.cc/ipfs

请在 https://web3.storage 进行申请 api token 
