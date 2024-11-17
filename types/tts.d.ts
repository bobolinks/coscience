// 官方支持的所有中文声色
declare type SpeechSynthesisVoiceNameCN =
  //Xiaotong,   Xiaotong女中文(吴语，简体)
  'wuu-CN-XiaoxiaoNeural' |
  //Yunzhe,     Yunzhe男中文(吴语，简体)
  'wuu-CN-YunzheNeural' |
  //XiaoMin,    XiaoMin女中文(粤语，简体)
  'yue-CN-XiaoMinNeural' |
  //YunSong,    YunSong男中文(粤语，简体)
  'yue-CN-YunSongNeural' |
  //Xiaoxiao,   晓晓女中文(普通话，简体),,, 21 样式助理, 聊天, 客户服务, 新闻, 撒娇, 愤怒, 平静, 愉悦, 不满, 害怕, 温柔, 抒情, 悲伤, 严厉, 诗歌朗诵, 友好, 聊天 - 休闲, 低语, 抱歉, 兴奋, 默认活泼、温暖的声音，具有多种场景风格和情感。
  'zh-CN-XiaoxiaoNeural' |
  //Yunxi,      云希男中文(普通话，简体),,, 13 样式旁白-放松, 尴尬, 害怕, 愉悦, 不满, 严厉, 愤怒, 悲伤, 沮丧, 聊天, 助理, 新闻, 默认活泼、阳光的声音，具有丰富的情感，可用于许多对话场景。
  'zh-CN-YunxiNeural' |
  //Yunjian,    云健男中文(普通话，简体),,, 11 样式旁白-放松, 体育解说, 体育解说-兴奋, 愤怒, 不满, 愉悦, 悲伤, 严厉, 沮丧, 纪录片-旁白, 默认
  'zh-CN-YunjianNeural' |
  //Xiaoyi,     晓伊女中文(普通话，简体),,, 10 样式愤怒, 不满, 撒娇, 愉悦, 害怕, 悲伤, 尴尬, 严厉, 温柔, 默认
  'zh-CN-XiaoyiNeural' |
  //Yunyang,    云扬男中文(普通话，简体),,, 4 样式客户服务, 旁白 - 专业, 新闻 - 休闲, 默认专业、流利的声音，具有多种场景风格。
  'zh-CN-YunyangNeural' |
  //Xiaochen,   晓辰女中文(普通话，简体),,, 2 样式实时广告, 默认休闲、放松的声音，用于自发性对话和会议听录。
  'zh-CN-XiaochenNeural' |
  //Xiaohan,    晓涵女中文(普通话，简体),,, 11 样式平静, 害怕, 愉悦, 不满, 严厉, 愤怒, 悲伤, 温柔, 撒娇, 尴尬, 默认温暖、甜美、富有感情的声音，可用于许多对话场景。
  'zh-CN-XiaohanNeural' |
  //Xiaomeng,   晓梦女中文(普通话，简体),,, 2 样式聊天, 默认
  'zh-CN-XiaomengNeural' |
  //Xiaomo,     晓墨女中文(普通话，简体),,, 13 样式尴尬, 平静, 害怕, 愉悦, 不满, 严厉, 愤怒, 悲伤, 沮丧, 撒娇, 温柔, 羡慕, 默认清晰、放松的声音，具有丰富的角色扮演和情感，适合音频书籍。
  'zh-CN-XiaomoNeural' |
  //Xiaoqiu,    晓秋女中文(普通话，简体)知性、舒适的声音，适合阅读长篇内容。
  'zh-CN-XiaoqiuNeural' |
  //Xiaorui,    晓睿女中文(普通话，简体),,, 5 样式平静, 害怕, 愤怒, 悲伤, 默认成熟、睿智的声音，具有丰富的情感，适合音频书籍。
  'zh-CN-XiaoruiNeural' |
  //Xiaoshuang, 晓双女中文(普通话，简体),,, 2 样式聊天, 默认可爱、愉悦的声音，可应用于许多儿童相关场景。
  'zh-CN-XiaoshuangNeural' |
  //Xiaoxiao Multilingual,晓晓 多语言女中文(普通话，简体) +90
  'zh-CN-XiaoxiaoMultilingualNeural' |
  //Xiaoyan,    晓颜女中文(普通话，简体)训练有素、舒适的声音，用于客户服务和对话场景。
  'zh-CN-XiaoyanNeural' |
  //Xiaoyou,    晓悠女中文(普通话，简体)天使般的清晰声音，可以应用于许多儿童相关场景。
  'zh-CN-XiaoyouNeural' |
  //Xiaozhen,   晓甄女中文(普通话，简体),,, 7 样式愤怒, 不满, 愉悦, 害怕, 悲伤, 严厉, 默认
  'zh-CN-XiaozhenNeural' |
  //Yunfeng,    云枫男中文(普通话，简体),,, 8 样式愤怒, 不满, 愉悦, 害怕, 悲伤, 严厉, 沮丧, 默认
  'zh-CN-YunfengNeural' |
  //Yunhao,     云皓男中文(普通话，简体),,, 2 样式广告-欢快, 默认
  'zh-CN-YunhaoNeural' |
  //Yunxia,     云夏男中文(普通话，简体),,, 6 样式平静, 害怕, 愉悦, 愤怒, 悲伤, 默认
  'zh-CN-YunxiaNeural' |
  //Yunye,      云野男中文(普通话，简体),,, 9 样式尴尬, 平静, 害怕, 愉悦, 不满, 严厉, 愤怒, 悲伤, 默认成熟、放松的声音，具有多种情感，适合音频书籍。
  'zh-CN-YunyeNeural' |
  //Yunze,      云泽男中文(普通话，简体),,, 10 样式平静, 害怕, 愉悦, 不满, 严厉, 愤怒, 悲伤, 沮丧, 纪录片-旁白, 默认
  'zh-CN-YunzeNeural' |
  //Xiaochen Multilingual,晓辰 多语言女中文(普通话，简体) +90预览
  'zh-CN-XiaochenMultilingualNeural' |
  //Xiaorou,    晓柔女中文(普通话，简体)预览
  'zh-CN-XiaorouNeural' |
  //Xiaoxiao Dialects,晓晓 方言女中文(普通话，简体) +10预览
  'zh-CN-XiaoxiaoNeural' |
  //Xiaoyu Multilingual,晓雨 多语言女中文(普通话，简体) +90预览
  'zh-CN-XiaoyuMultilingualNeural' |
  //Yunjie,     云杰男中文(普通话，简体)预览
  'zh-CN-YunjieNeural' |
  //Yunyi Multilingual,云逸 多语言男中文(普通话，简体) +90预览
  'zh-CN-YunyiMultilingualNeural' |
  //Xiaoxuan,   晓萱女中文(普通话，简体),,, 9 样式平静, 害怕, 愉悦, 不满, 严厉, 愤怒, 温柔, 沮丧, 默认自信、有能力的声音，具有丰富的角色扮演和情感，适合音频书籍。
  'zh-CN-XiaoxuanNeural' |
  //Yunqi,      云奇 广西男中文(广西口音普通话，简体)预览
  'zh-CN-guangxi-YunqiNeural' |
  //Yundeng,    云登男中文(中原官话河南，简体)
  'zh-CN-henan-YundengNeural' |
  //Xiaobei,    晓北 辽宁女中文(东北官话，简体)预览
  'zh-CN-liaoning-XiaobeiNeural' |
  //Yunbiao,    云彪 辽宁男中文(东北官话，简体)预览
  'zh-CN-liaoning-YunbiaoNeural' |
  //Xiaoni,     晓妮女中文(中原官话陕西，简体)预览
  'zh-CN-shaanxi-XiaoniNeural' |
  //Yunxiang,   云翔男中文(冀鲁官话，简体)
  'zh-CN-shandong-YunxiangNeural' |
  //Yunxi,      云希 四川男中文(西南官话，简体)预览"
  'zh-CN-sichuan-YunxiNeural';
