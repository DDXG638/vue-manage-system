import Vue from 'vue'
import axios from 'axios'
import qs from 'qs'
Vue.prototype.$http = axios

// 应用数据和后台富文本数据的地址不同
// let testURL = 'http://localhost:3333'
let testURL = 'http://119.29.128.86:3333'

const ajaxURL = {
    // 用户管理-获取用户信息（分页）post, page = 1, pageCount = 10
    getUsers: testURL + '/manager/getUsersAll',
    // 用户管理-设置/取消用户管理员权限 post {username, isManager = '0'}
    userManager: testURL + '/manager/setUserManager',

    // 分类管理-获取分类信息 post
    getTagsList: testURL + '/manager/getTagsList',
    // 分类管理-添加新闻栏目分类 post {classid, classname, classpath, showclass}
    addNewsTags: testURL + "/manager/addNewsTags",
    // 分类管理-修改分类信息 post {classid, classname, showclass}
    editNewsTags: testURL + '/manager/editNewsTags',
    // 分类管理-删除新闻分类 post {classid}
    deleteTags: testURL + '/manager/deleteTags',

    // 新闻数据管理-爬取今日头条的新闻数据 get {tagName}
    getNewsInfo: testURL + "/manager/getNewsInfo",
    // 新闻数据管理-获取新闻信息数据 post {classid, page, count}
    getNewsLists: testURL + "/manager/getNewsLists",
    // 新闻数据管理-添加新闻数据 post  {classid, title, befrom, newstext, titlepic, titlepic2, titlepic3, ptitlepic}
    saveNewsDetail: testURL + '/manager/saveNewsDetail',
    // 新闻数据管理-删除新闻 post {id}
    removeNews: testURL + "/manager/removeNews",
    // 新闻详情页面的数据 post {id}
    getNewsDetail: testURL + "/manager/getNewsDetail",
    // 编辑新闻详情页面的数据 post { id, classid, title, befrom, newstext, titlepic, titlepic2, titlepic3, ptitlepic }
    editNewsDetail: testURL + "/manager/editNewsDetail",

    // 获取七牛上传图片的token
    getQiNiuToken: testURL + "/manager/getQiNiuInfo",

    // 获取用户评论信息
    getUsersCommentsLists: testURL + "/manager/getCommentLists",
    // 删除用户/新闻评论 userId、newsDetailId
    deleteComment: testURL + "/manager/deleteComment",

    // 默认配置管理-获取默认配置信息
    getDefaultConfig: testURL + "/manager/getDefaultConfig",
    // 默认配置管理-删除推荐信息 newsDetail_id
    deleteConfig: testURL + "/manager/deleteConfig",
    // 默认配置管理-添加推荐信息 newsDetailId
    addHotNewsDetail: testURL + "/manager/addHotNewsDetail",
    // 默认配置管理-修改配置信息 {openPageUrl, openPageRouter, searchTip}
    changeConfig: testURL + "/manager/changeConfig",

    // 导入今日头条的shuju的数据
    importNewsData: testURL + "/manager/getNewsInfo"
}

export var fetch = async(type = 'POST', url = '', data = {}) => {
    let result
    type = type.toUpperCase()
    url = ajaxURL[url]
    if (type === 'GET') {
        await axios.get(url, { params: data })
        .then(res => {
            result = res.data
        })
    } else if (type === 'POST') {
        await axios.post(url, qs.stringify(data))
        .then(res => {
            result = res.data
        })
    }
    return result
}

export var baseUrl = testURL

