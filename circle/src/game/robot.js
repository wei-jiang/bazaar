import _ from 'lodash'
import moment from 'moment'
import Noty from 'noty';
import net from '../net'
import util from '../common/util'
import Player from './player';
import adb from "../db";

let poem = [
    '人事一朝尽，荒芜三径休。始闻漳浦卧，奄作岱宗游。',
    '池水犹含墨，风云已落秋。今宵泉壑里，何处觅藏舟。',
    '彭泽先生柳，山阴道士鹅。我来从所好，停策汉阴多。',
    '重以观鱼乐，因之鼓枻歌。崔徐迹未朽，千载揖清波。',
    '带雪梅初暖，含烟柳尚青。来窥童子偈，得听法王经。',
    '会理知无我，观空厌有形。迷心应觉悟，客思未遑宁。',
    '给园支遁隐，虚寂养身和。春晚群木秀，间关黄鸟歌。',
    '林栖居士竹，池养右军鹅。炎月北窗下，清风期再过。',
    '义公习禅处，结构依空林。户外一峰秀，阶前群壑深。',
    '夕阳连雨足，空翠落庭阴。看取莲花净，应知不染心。',
    '白鹤青岩半，幽人有隐居。阶庭空水石，林壑罢樵渔。',
    '岁月青松老，风霜苦竹疏。睹兹怀旧业，回策返吾庐。',
    '精舍买金开，流泉绕砌回。芰荷薰讲席，松柏映香台。',
    '法雨晴飞去，天花昼下来。谈玄殊未已，归骑夕阳催。',
    '池上青莲宇，林间白马泉。故人成异物，过客独潸然。',
    '既礼新松塔，还寻旧石筵。平生竹如意，犹挂草堂前。',
    '与君园庐并，微尚颇亦同。耕钓方自逸，壶觞趣不空。',
    '门无俗士驾，人有上皇风。何处先贤传，惟称庞德公。',
    '弱岁早登龙，今来喜再逢。如何春月柳，犹忆岁寒松。',
    '烟火临寒食，笙歌达曙钟。喧喧斗鸡道，行乐羡朋从。',
    '闻就庞公隐，移居近洞湖。兴来林是竹，归卧谷名愚。',
    '挂席樵风便，开轩琴月孤。岁寒何用赏，霜落故园芜。',
    '府僚能枉驾，家酝复新开。落日池上酌，清风松下来。',
    '厨人具鸡黍，稚子摘杨梅。谁道山公醉，犹能骑马回。',
    '二月湖水清，家家春鸟鸣。林花扫更落，径草踏还生。',
    '酒伴来相命，开尊共解酲。当杯已入手，歌妓莫停声。',
    '我爱陶家趣，园林无俗情。春雷百卉坼，寒食四邻清。',
    '伏枕嗟公干，归山羡子平。年年白社客，空滞洛阳城。',
    '故人具鸡黍，邀我至田家。绿树村边合，青山郭外斜。',
    '开筵面场圃，把酒话桑麻。待到重阳日，还来就菊花。',
    '山公能饮酒，居士好弹筝。世外交初得，林中契已并。',
    '纳凉风飒至，逃暑日将倾。便就南亭里，馀尊惜解酲。',
    '北阙休上书，南山归敝庐。不才明主弃，多病故人疏。',
    '白发催年老，青阳逼岁除。永怀愁不寐，松月夜窗虚。',
    '樵牧南山近，林闾北郭赊。先人留素业，老圃作邻家。',
    '不种千株橘，惟资五色瓜。邵平能就我，开径剪蓬麻。',
    '家本洞湖上，岁时归思催。客心徒欲速，江路苦邅回。',
    '残冻因风解，新正度腊开。行看武昌柳，仿佛映楼台。',
    '挂席东南望，青山水国遥。舳舻争利涉，来往接风潮。',
    '问我今何去，天台访石桥。坐看霞色晓，疑是赤城标。',
    '皇皇三十载，书剑两无成。山水寻吴越，风尘厌洛京。',
    '扁舟泛湖海，长揖谢公卿。且乐杯中物，谁论世上名。',
    '已失巴陵雨，犹逢蜀坂泥。天开斜景遍，山出晚云低。',
    '馀湿犹沾草，残流尚入溪。今宵有明月，乡思远凄凄。',
    '远游经海峤，返棹归山阿。日夕见乔木，乡关在伐柯。',
    '愁随江路尽，喜入郢门多。左右看桑土，依然即匪他。',
    '日暮马行疾，城荒人住稀。听歌知近楚，投馆忽如归。',
    '鲁堰田畴广，章陵气色微。明朝拜嘉庆，须著老莱衣。',
    '他乡逢七夕，旅馆益羁愁。不见穿针妇，空怀故国楼。',
    '绪风初减热，新月始临秋。谁忍窥河汉，迢迢问斗牛。',
    '星罗牛渚夕，风退鹢舟迟。浦溆尝同宿，烟波忽间之。',
    '榜歌空里失，船火望中疑。明发泛潮海，茫茫何处期。',
]
class Robot extends Player {
    constructor(map, wi) {
        super(map, wi);
        let interval = util.getRandInt(2, 10) * 1000;
        setTimeout(this.roaming.bind(this), interval)
        interval = util.getRandInt(3, 60 * 30) * 1000;
        setTimeout(this.babble.bind(this), interval)
    }
    roaming() {
        let dx = util.getRandFloat(-1, 1)
        let dy = util.getRandFloat(-1, 1)
        this.move(dx, dy)
        let interval = util.getRandInt(2, 10) * 1000;
        setTimeout(this.roaming.bind(this), interval)
    }
    static speak_of(r) {
        let i = util.getRandInt(0, poem.length - 1);
        let data = {
            from: r.wi.nickname,
            to: '所有人',
            headimgurl: r.wi.headimgurl,
            content: poem[i],
            dt: moment().format("YYYY-MM-DD HH:mm:ss")
        };
        new Noty({
            layout: 'center',
            timeout: 3000,
            text: `<div style="display:flex;"><img width=40 height=40 src="${data.headimgurl}"/><div>${data.from}说:${data.content}</div></div>`
        }).show();
        adb.then(db => {
            db.chat_log.insert(data);
            vm.$emit('refresh_chat_log', '');
        });
      }
    babble() {
        Robot.speak_of_throttle(this)
        let interval = util.getRandInt(60, 3600) * 1000;
        setTimeout(this.babble.bind(this), interval)
    }

}
Robot.speak_of_throttle = _.throttle(Robot.speak_of, 4000)
export default Robot;