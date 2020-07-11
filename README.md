# <center>[upload-cos](https://github.com/Jehan-Gao/upload-cos)</center>
**upload-cos** 是一个可以将指定的**静态资源**上传到腾讯云对象存储(COS)的命令行工具。

<a href="https://travis-ci.com/Jehan-Gao/upload-cos">
<img src="https://travis-ci.com/Jehan-Gao/upload-cos.svg?branch=master">
</a>
<a href="https://www.npmjs.com/package/upload-cos">
<img src="https://img.shields.io/npm/v/upload-cos">
</a>

## [CHANGELOG](./CHANGELOG.md)

## Install 
#### Global
Install globally (add to your PATH):
``` shell 
$ npm install upload-cos -g
```
#### Local
Install and add to devDependencies: 
```shell
$ npm install upload-cos --save-dev
```

## Usage
### 1.配置
在命令行使用upload-cos之前，你需要在你的项目根目录下创建一个 `.env` 文件。
`.env`文件需要设置以下参数：
  | Key | Value | 是否必填 |
  | :---: | :----:  | :---:     |
  | COS_SECRET_ID | 用户的 SecretId | 是 |
  | COS_SECRET_KEY | 用户的 SecretKey | 是 |
  | COS_BUCKET | 存储桶名称 | 是 | 
  | COS_REGION | 存储桶所在地 | 是 |
  | COS_DOMAIN | 域名 | 是 |
  | COS_DIRECTORY | 存放资源的根目录 | 是 |

  
#### example:
  ```
   .env

COS_SECRET_ID=HFAFHAOFKAHFKAFA

COS_SECRET_KEY=JSHAFHAKHFKAHFKSHAKF

COS_REGION=ap-beijing

COS_DOMAIN=https://cdn.example.com

COS_BUCKET=example-bucket-11111111

COS_DIRECTORY=example-dir
  ```

  详细请参考腾讯云COS JavaScript SDK 文档：https://cloud.tencent.com/document/product/436/11459

  
### 2.在命令行中使用 
确保 `.env` 文件的参数配置正确之后， 就可以通过命令行使用 upload-cos 上传指定的文件夹或文件。

假设现有如下目录结构：

``` 
project
  |dist
    |css
      |test.css
    |js
      |test.js
    |images
      |cdn
        |a.png
    |index.html
  |src
  |.env
  ...
```


#### 上传指定的文件目录：
```shell 
$ upload-cos -d dist

output => 
  https://cdn.example.com/example-dir/dist/css/test.css
  https://cdn.example.com/example-dir/dist/js/test.js
  https://cdn.example.com/example-dir/dist/images/cdn/a.png
  https://cdn.example.com/example-dir/dist/index.html

```

#### 上传指定的文件目录下的子目录：
```shell 
$ upload-cos -d dist/

output => 
  https://cdn.example.com/example-dir/css/test.css
  https://cdn.example.com/example-dir/js/test.js
  https://cdn.example.com/example-dir/images/cdn/a.png
  https://cdn.example.com/example-dir/index.html

```

其中, https://cdn.example.com 和 example-dir 都是通过 `.env` 文件配置的。


#### 上传指定的文件：
``` shell
$ upload-cos -f dist/css/test.css

output => 
  https://cdn.example.com/example-dir/test.css

$ upload-cos -f dist/images/cdn/a.png

output => 
  https://cdn.example.com/example-dir/a.png
```
通过 -f 指令上传文件，会将读取到的文件上传到 `COS_DIRECTORY(存放资源的根目录)`下。




#### 指定上传的子目录
 > 有些场景,你可能需要将文件上传到指定的文件目录,例如想将 a.png 上传到 example-dir/custom/下。

``` shell 
$ upload-cos -f dist/images/cdn/a.png -t custom

output => 
  https://cdn.example.com/example-dir/custom/a.png


$ upload-cos -d dist/ -t custom

output => 
  https://cdn.example.com/example-dir/custom/css/test.css
  https://cdn.example.com/example-dir/custom/js/test.js
  https://cdn.example.com/example-dir/custom/images/cdn/a.png
  https://cdn.example.com/example-dir/custom/index.html

```
    
#### 读取不同的 `.env.*` 文件
在实际的业务场景中，可能要根据开发环境的不同配置不同的COS参数。例如，在 `testing` 的时候，需要将静态资源上传到 `测试存储桶` ，在 `production` 的时候，需要将静态资源上传到 `正式的存储桶` 。

而 upload-cos 默认会读取 `.env`文件。你可以创建多个 `.env.*` 文件来配置COS参数。

创建一个 `.env.testing`:

```
 .env.testing

COS_SECRET_ID=HFAFHAOFKAHFKAFA

COS_SECRET_KEY=JSHAFHAKHFKAHFKSHAKF

COS_REGION=ap-beijing

COS_DOMAIN=https://cdn.example-testing.com

COS_BUCKET=example-bucket-test-22222

COS_DIRECTORY=example-dir-test
```
通过 -m 指令 来读取指定的 .env 文件
``` shell 
$ upload-cos -m testing -d dist

output => 
  https://cdn.example-testing.com/example-dir-test/dist/css/test.css
  https://cdn.example-testing.com/example-dir-test/dist/js/test.js
  https://cdn.example-testing.com/example-dir-test/dist/images/cdn/a.png
  https://cdn.example-testing.com/example-dir-test/dist/index.html

```

可以看到，通过 -m 指定参数后，会读取对应的 `.env.*` 文件。
这里通过 -m testing 指定参数后，读取的是 `.env.testing` 文件。

再创建一个 `.env.production`：
```
.env.production

COS_SECRET_ID=HFAFHAOFKAHFKAFA

COS_SECRET_KEY=JSHAFHAKHFKAHFKSHAKF

COS_REGION=ap-beijing

COS_DOMAIN=https://cdn.example-pro.com

COS_BUCKET=example-bucket-pro-22222

COS_DIRECTORY=example-dir-pro
```

``` shell 
$ upload-cos -m production -d dist

output => 
  https://cdn.example-pro.com/example-dir-pro/dist/css/test.css
  https://cdn.example-pro.com/example-dir-pro/dist/js/test.js
  https://cdn.example-pro.com/example-dir-pro/dist/dist/images/cdn/a.png
  https://cdn.example-pro.com/example-dir-pro/dist/dist/index.html

```

#### 设置.gitignore
如果你的项目是公开的，那么在 .env 和 .env.* 文件配置COS keys，会让你在推送代码时将私密信息被上传到远程仓库，此时你需要在 .gitignore 中添加忽略的文件。
```
.gitignore

...
...
.env
.env.*
```

## CDN 缓存刷新
目前, 腾讯云 CDN 缓存刷新有两种方式:
  - 通过控制台手动刷新。详见：https://cloud.tencent.com/document/product/228/6299

  - 通过COS结合SCF，实现在COS文件更新时自动刷新。
  详见：https://cloud.tencent.com/document/product/436/30434


## End
如果小伙伴们在使用过程中发现bug，[点击这里提bug](https://github.com/Jehan-Gao/upload-cos/issues)。
如果有小伙伴们想在原有功能上增加新功能，[欢迎提PR](https://github.com/Jehan-Gao/upload-cos/pulls)。

## License
[MIT](./LICENSE)










