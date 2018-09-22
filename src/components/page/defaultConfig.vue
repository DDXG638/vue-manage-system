<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-date"></i> 配置管理</el-breadcrumb-item>
                <el-breadcrumb-item>默认配置</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="form-box">
            <el-form ref="form" :model="form" label-width="120px">
                <el-form-item label="开屏页跳转连接">
                    <el-input v-model="form.openPageRouter"></el-input>
                </el-form-item>
                <el-form-item label="开屏页图片">
                    <el-input v-model="form.openPageUrl"></el-input>
                    <el-upload class="upload-demo" :action="qnLocation" :before-upload='beforeUpload' :data="uploadData" :on-success='upScuccess'
                               ref="upload">
                        <el-button size="small" type="primary" v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="上传图片中,请稍候">
                            点击上传
                        </el-button>
                        <br>
                        <img v-if="form.openPageUrl" :src="form.openPageUrl" class="avatar">
                    </el-upload>
                </el-form-item>
                <el-form-item label="搜索框提示文本">
                    <el-input v-model="form.searchTip"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="saveConfig">保存</el-button>
                    <el-button>取消</el-button>
                </el-form-item>
            </el-form>
        </div>
        <p class="text-p"><strong>推荐新闻：</strong></p>
        <el-table :data="form.searchs" border style="width: 90%" ref="multipleTable" >
            <el-table-column prop="_id" label="_id" width="220">
            </el-table-column>
            <el-table-column prop="befrom" label="新闻来源" width="180">
            </el-table-column>
            <el-table-column prop="title" label="新闻标题">
            </el-table-column>
            <el-table-column prop="classid" label="分类ID" width="80">
            </el-table-column>
            <el-table-column label="操作" width="80">
                <template slot-scope="scope">
                    <el-button size="small" type="danger"
                               @click="deleteConfig(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="handle-box">
            <el-input v-model="add_newsDetail_id" placeholder="输入新闻ID" class="handle-input mr10"></el-input>
            <el-button type="primary" icon="el-icon-plus" @click="addNewsDetail">添加推荐新闻</el-button>
        </div>

    </div>
</template>

<script>
    import {fetch} from "../../config/fetch";
    const STATICDOMAIN = 'http://p6iiiwy0l.bkt.clouddn.com/'; // 图片服务器的域名，展示时使用

    export default {
        name: 'default-config',
        data: function(){
            return {
                form: {
                    openPageRouter: '',
                    openPageUrl: '',
                    searchTip: '',
                    searchs: []
                },
                add_newsDetail_id: '',
                uploadData: {},
                fullscreenLoading: false,
            }
        },
        mounted() {
            this.getData();
        },
        methods: {
            async saveConfig() {
                let params = {
                    openPageUrl: this.form.openPageUrl,
                    openPageRouter: this.form.openPageRouter,
                    searchTip: this.form.searchTip
                };
                if (params.openPageUrl.length > 0) {
                    let res = await fetch("post", "changeConfig", params);
                    if (res.code === 0) {
                        this.$message.success('修改成功！');
                        this.getData();
                    } else {
                        this.$message({
                            message: '修改失败！',
                            type: 'error'
                        });
                    }
                } else {
                    this.$message({
                        message: '开屏页图片必须要有！',
                        type: 'info'
                    });
                }
            },
            async getData() {
                let res = await fetch('post', 'getDefaultConfig');
                if (res.code === 0) {
                    this.form = res.data[0];
                }
            },
            async deleteConfig(index, row) {
                // this.$message.error('删除了');
                this.$confirm('确定要删除这条推荐新闻吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async() => {
                    console.log(row);
                    let params = {
                        newsDetail_id: row._id
                    };
                    let res = await fetch("post", "deleteConfig", params);

                    if (res.code === 0) {
                        this.$message({message: '删除成功！', type: 'success'});
                        this.getData();
                    } else {
                        this.$message({message: res.msg, type: 'error'});
                    }

                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            async addNewsDetail() {
                if (this.add_newsDetail_id.length > 0) {
                    let res = await fetch("post", "addHotNewsDetail", {newsDetailId: this.add_newsDetail_id});
                    if (res.code === 0) {
                        this.$message({
                            message: '添加推荐新闻成功！',
                            type: 'success'
                        });
                        this.getData();
                    } else {
                        this.$message({
                            message: '添加推荐新闻失败！',
                            type: 'error'
                        });
                    }
                } else {
                    this.$message({
                        message: '请输入新闻ID',
                        type: 'info'
                    });
                }

            },
            // 图片上传之前调取的函数,这个钩子还支持 promise.上传文件之前的钩子，参数为上传的文件，若返回 false 或者返回 Promise 且被 reject，则停止上传。
            beforeUpload (file) {
                return this.qnUpload(file);
            },
            // 文件上传成功时的钩子  function(response, file, fileList)
            upScuccess (e, file, fileList) {
                console.log(e);
                this.fullscreenLoading = false;
                let vm = this;
                let url = '';
                url = STATICDOMAIN + e.key;
                if (url != null && url.length > 0) { // 将文件上传后的URL地址插入到编辑器文本中
                    this.form.openPageUrl = url;
                }
                this.$refs['upload'].clearFiles(); // 插入成功后清除input的内容
            },
            // 七牛上传文件
            async qnUpload (file) {
                this.fullscreenLoading = true;
                const suffix = file.name.split('.'); // 分割文件名
                // 获取文件的后缀名称“.png”
                const ext = suffix.splice(suffix.length - 1, 1)[0];
                // 像后台获取key 和 token
                let res = await fetch("post", "getQiNiuToken");
                if (res.code === 0) {
                    this.uploadData = {
                        key: `image/${suffix.join('.')}_${new Date().getTime()}.${ext}`,
                        token: res.data
                    }
                } else {
                    this.fullscreenLoading = false;
                    this.$message({
                        type: 'error',
                        message: '获取七牛token失败，无法上传图片！'
                    });
                }
            }
        },
        computed: {
            // 获取当前的页面的http协议
            qnLocation: () => {
                return location.protocol === 'http:' ? 'http://upload.qiniu.com' : 'https://up.qbox.me'
            }
        }
    }
</script>

<style lang="stylus">
    .text-p {
        color: rgb(96, 98, 102);
        line-height: 2;
    }
    .handle-box{
        margin-top: 20px;
    }
    .handle-input{
        width: 300px;
        display: inline-block;
    }
    .el-upload--text {
        height: 500px;
        img {
            height: 90%;
        }
    }
</style>
