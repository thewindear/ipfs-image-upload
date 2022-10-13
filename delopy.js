const { getFilesFromPath, Web3Storage } = require('web3.storage');
const { loadEnv } = require('vite');
const env = loadEnv('serve', process.cwd(), '');
const client = new Web3Storage({token: env.DELOPY_API_TOKEN});
async function deploy(path) {
    const files = await getFilesFromPath(path)
    for (const f of files) {
        f.name = f.name.replace('/dist', '');
    }
    const cid = await client.put(files)
    console.log(`部署成功: ${files.length} 个文件. cid: ${cid}`)
    console.log(`前端地址 1:https://${cid}.ipfs.dweb.link`)
    console.log(`前端地址 1:https://${cid}.ipfs.w3s.link`)
}

deploy('./dist/')
    .catch(e => {
        console.error('deploy error:', e);
    })
