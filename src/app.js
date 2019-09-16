import React from 'react'
import './app.less'
import {uploads, getToken, getFiles, buildData} from './util'

const BaseUrl = 'http://460mix.ekuaibao.net'
const Token = '1xKJrb1NrGgogX-iY_J-b0'
const CorpId = 'fjw8mxuWbY0400'
const GetTokeUrl =  `${BaseUrl}/api/v1/attachment/attachments/token?corpId=${CorpId}&accessToken=${Token}`
const GetFileUrl = `${BaseUrl}/api/v1/attachment/attachments?corpId=${CorpId}&accessToken=${Token}`



export default class App extends React.Component {
    state = {
        token: {},
        images: []
    }
    componentDidMount() {
        getToken(GetTokeUrl).then(value => {
            this.setState({token: value})
        })
    }

    handleChange = (e) => {
        const { token } = this.state
        const files = e.target.files
        const fs = []
        for(let i = 0; i < files.length; i++) {
            let file = files[i]
            const f = {
                action:'http://ekuaibao.oss-cn-hangzhou.aliyuncs.com/',
                filename: 'file',
                file,
                data: buildData(file, token)
            }
            fs.push(f)
        }
        uploads(fs).then(data => {
            const params = []
            data.forEach(item => {
                params.push({
                    key: item.value.key,
                    filename: item.value['x:originalname']
                })
            })
            console.log(params)
            return getFiles(params, GetFileUrl)
        }).then(data => {
            this.setState({images: data || []})
        })
    }

    renderImages = () => {
        const {images} = this.state
        return images.map(item => {
            const { url } = item
            return <img src={url} />
        })
    }

    render() {
        return <div className="wrapper">
            <input type="file" accept="image/*" multiple id="file" onChange={this.handleChange}/>
            {this.renderImages()}
        </div>
    }
}