$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$ArticleRoot = Join-Path $Root "articles"
$DataRoot = Join-Path $Root "data"
$Date = "2026-05-17"

$SectionNames = @{
  zuowen = "作文专区"
  wenyan = "文言文研习"
  shici = "诗词曲赋"
  yuedu = "现代文阅读"
  mingzhu = "名著导读"
  beike = "备课资源"
}

$SectionLinks = @{
  zuowen = "zuowen.html"
  wenyan = "wenyan.html"
  shici = "shici.html"
  yuedu = "yuedu.html"
  mingzhu = "mingzhu.html"
  beike = "beike.html"
}

$Articles = @(
  @{ section="zuowen"; slug="guanxi-si-bian-shen-ti"; title="关系型思辨作文审题方法"; tags=@("作文","思辨","审题","议论文"); summary="梳理二元、三元关系型作文的审题路径，帮助学生把材料关系转化为清晰论点。"; points=@(
    @("先看关系，不急着站队","关系型作文给出的关键词往往不是让学生简单二选一，而是要求看清二者之间的条件、边界和转化。比如守正与创新、快与慢、个人与时代，都需要先判断是互补、递进、制约还是冲突。审题时先圈关键词，再用一句话说清关系，文章才不会写散。"),
    @("把概念放回情境","概念只有进入具体情境才有思辨价值。可以追问：谁在什么处境中面对这一组关系？如果只强调一端会怎样？现实中需要怎样平衡？这样的追问能让文章从口号走向分析。"),
    @("用分论点形成推进","建议按辨概念、析关系、明做法推进。第一段说明二者不是简单对立，第二段分析失衡的危害，第三段落到青年行动。分论点之间要有层次，不要把三段都写成相同意思。")
  )},
  @{ section="zuowen"; slug="sucai-zhuanhua-lunzheng"; title="高考作文素材如何转化为论证"; tags=@("作文","素材","论证","写作技巧"); summary="从素材选择、压缩叙述到观点分析，训练学生把素材写成论证而不是人物简介。"; points=@(
    @("素材先服务观点","素材不是越多越好，而是要能证明分论点。使用前先问：这个人物、事件或金句能证明哪一句观点？如果说不清，就暂时不要写。作文中的素材不是资料展示，而是思想证据。"),
    @("压缩叙述，放大分析","人物生平和事件经过要压缩，只保留与观点有关的事实。随后用因果、对比、追问写分析，如「可贵之处不只在于……更在于……」。这样素材才会从叙事变成论证。"),
    @("一材多用要换角度","同一素材可用于青年担当、文化传承、科技创新等主题，但每次叙述重心都要改变。主题变了，素材角度也要变，不能原封不动搬用。")
  )},
  @{ section="zuowen"; slug="qingnian-chengzhang-zhuti"; title="青年成长主题素材整理"; tags=@("作文","青年","成长","素材"); summary="围绕理想、担当、挫折、时代四个角度，整理青年成长类作文的写作思路。"; points=@(
    @("成长要写出过程","青年成长不只是宣称奋斗，而是写出从迷惘到清醒、从被动到主动、从关注自我到理解时代的变化。材料可从个人突破、责任担当和价值选择三个方向切入。"),
    @("理想要连接时代","写理想时，不宜只写个人成功。更成熟的表达是：个人理想以自我为起点，以时代需要为坐标。理想落实到行动中，才不是悬空的口号。"),
    @("挫折要写认知更新","挫折类素材不能只写吃苦后成功，而要写困难如何改变方法、磨炼意志、校准方向。成长的真正意义，是人在选择中变得更清醒、更有承担。")
  )},
  @{ section="wenyan"; slug="shi-ci-xin-yongfa"; title="高频实词「信」用法整理"; tags=@("文言文","实词","信","翻译"); summary="整理「信」的常见义项和翻译判断方法，帮助学生在语境中准确辨析。"; points=@(
    @("抓住基本义","「信」的基本义与真实、诚信、相信有关。遇到这个字，先判断词性，再看前后搭配。它可作形容词译为真实诚信，可作动词译为相信信任，也可作副词译为确实。"),
    @("看搭配判断义项","若与言、约、交、民等词相关，多指诚信守信；若后接人、言论、消息，多指相信信任；若在判断议论中加强语气，常译为确实。不要用现代单一义硬套。"),
    @("翻译要代入语境","实词题最稳的方法是把可能义项放回原句试译。哪一个既符合语法位置，又能让句意顺畅，才是更合适的解释。")
  )},
  @{ section="wenyan"; slug="zhi-zi-liu-lei"; title="「之」字六类用法"; tags=@("文言文","虚词","之","句式"); summary="归纳「之」的代词、助词、动词等常见用法，并提供课堂判断口诀。"; points=@(
    @("动后多为代词","「之」在动词后常作宾语，代指前文的人、物或事，可译为他、它、这件事。翻译时要找准指代对象，不能含糊写成一个「之」。"),
    @("名间常作结构助词","当「之」连接定语和中心语，常译为「的」。若位于主谓之间，则多不译，只取消句子独立性。两类位置相近，但结构功能不同。"),
    @("句式标志要识别","「之」还可作宾语前置或定语后置标志，一般不译；若后接地点，也可能作动词，译为到、往。口诀是：动后代，名间的；主谓间，不必译；前置后置看句式，地点之后可能去。")
  )},
  @{ section="wenyan"; slug="wenyan-fanyi-si-bu"; title="文言翻译四步法"; tags=@("文言文","翻译","方法","考点"); summary="用留、换、补、调四步处理文言翻译题，提升考场得分稳定性。"; points=@(
    @("留：保留专名","人名、地名、官职、年号等专有名词一般保留。保留不是偷懒，而是避免误译。若语境需要，可在现代汉语中补充说明。"),
    @("换：落实关键词","把古今异义和单音节词换成现代汉语。比如走、涕、妻子等词不能按现代常义硬套。关键词常是得分点，必须逐一落实。"),
    @("补与调：让句子通顺","文言常省略主语、宾语和介词，翻译时要根据上下文补出；宾语前置、定语后置、状语后置则要调整语序。先准确，再通顺。")
  )},
  @{ section="shici"; slug="yue-yixiang-guina"; title="「月」意象归纳"; tags=@("诗词","诗歌","意象","月","鉴赏"); summary="整理古诗词中「月」的常见情感指向和答题表达，帮助学生快速迁移。"; points=@(
    @("月常牵动思乡怀人","月亮普照远方，容易连接异地之人。若诗中有故园、远人、归梦、楼台等词，常可从思乡怀人角度分析。"),
    @("月也营造清冷孤寂","寒夜、空庭、残月等意象常形成静寂清寒的氛围，烘托诗人孤独、失意或漂泊感。答题时要写清景物如何作用于情感。"),
    @("圆缺可引出哲理","月的圆缺变化常暗示人生聚散、时光流转和悲欢无常。若诗歌基调旷达，也可写借月表达超越个人得失的人生思考。")
  )},
  @{ section="shici"; slug="moxie-yicuozhi"; title="默写易错字整理"; tags=@("诗词","诗歌","默写","易错字","古诗文"); summary="从字形、同音、语义和句意四个角度整理古诗文默写易错点。"; points=@(
    @("错字常源于不理解","默写不是只考背诵，也考词义和句意。同音字、形近字、虚词漏写，往往因为只记声音而没有理解语义。"),
    @("用语义区分同音字","遇到同音字，要问这个字在句中表示什么。与水相关看水部，与草木相关看草木部。部首和语境常能帮助学生稳定字形。"),
    @("建立错因清单","建议整理原句、易错字、错因三列表。每次订正不只改答案，还要写出是同音误写、形近混淆、不懂词义还是漏虚词。")
  )},
  @{ section="shici"; slug="biansai-shi-qinggan"; title="边塞诗常见情感"; tags=@("诗词","诗歌","边塞诗","情感","鉴赏"); summary="归纳边塞诗中的豪情、思乡、征战艰苦和历史反思等常见情感。"; points=@(
    @("边塞诗不只有豪迈","边塞诗常写大漠、关山、烽火、羌笛，既有建功立业的昂扬，也有久戍不归的乡愁和战争艰苦的苍凉。"),
    @("看意象判断情感","报国、破敌、长驱多指豪情；羌笛、明月、故园、归雁多指思乡；风沙、严寒、白骨等则可能引出对战争代价的思考。"),
    @("答案要写出交织感","很多边塞诗的动人处在豪情与苍凉并存。答题时可写壮阔景象烘托报国志向，也可写清冷声音触发征人乡思。")
  )},
  @{ section="yuedu"; slug="xiaoshuo-huanjing-zuoyong"; title="小说环境描写作用题"; tags=@("现代文阅读","小说","环境描写","答题方法"); summary="整理小说阅读中自然环境、社会环境描写的常见作用和答题路径。"; points=@(
    @("先分自然环境和社会环境","自然环境写天气、景物、时间、空间；社会环境写时代背景、风俗制度和人物处境。分清类型，答案才不会只剩「渲染气氛」。"),
    @("联系情节和人物","环境可交代背景、推动情节、制造冲突，也可烘托人物心理、暗示人物处境。作答要写出具体怎样推动、怎样烘托。"),
    @("提升到主题层面","荒凉村庄、拥挤城市、陈旧屋舍等环境，常能拓展小说的社会容量。答案最后可联系主题，说明环境增强了现实意味。")
  )},
  @{ section="yuedu"; slug="lunshu-shewu-jiaodu"; title="论述类文本设误角度"; tags=@("现代文阅读","论述类","设误","选择题"); summary="梳理论述类文本选择题常见设误方式，训练学生回到原文比对。"; points=@(
    @("选择题核心是比对","论述类选项常把原文概念、范围、条件、因果、程度稍作改动。不要凭印象判断，要带着选项回原文找证据。"),
    @("常见设误看四类","范围扩大或缩小、因果关系错位、概念偷换、程度绝对化，是高频设误。看到全部、必然、根本、只要等词要格外谨慎。"),
    @("做题步骤要稳定","先读题干明确对象，再圈选项关键词，最后定位原文逐词比对。若两个选项都像对的，优先比较范围词、程度词和逻辑关系。")
  )},
  @{ section="yuedu"; slug="sanwen-biaoti-zuoyong"; title="散文标题作用题"; tags=@("现代文阅读","散文","标题作用","答题方法"); summary="从内容、结构、情感、主题和表达效果五个角度分析散文标题。"; points=@(
    @("标题先解释含义","标题可能点明对象，也可能有象征意味。答题第一步是说清表层含义和深层含义，不能只写「吸引读者兴趣」。"),
    @("再看结构作用","若标题反复出现或贯穿多个片段，它往往是全文线索。可以答「串联材料，使文章内容集中，并与开头结尾形成照应」。"),
    @("最后落到情感主题","散文标题常寄托怀念、感激、愧疚或人生思考。完整答案可按含义、线索、情感、主题、表达效果组织。")
  )},
  @{ section="mingzhu"; slug="hongloumeng-renwu-guanxi"; title="《红楼梦》人物关系"; tags=@("名著","红楼梦","人物关系","整本书阅读"); summary="从家族结构、情感关系和人物对照入手，梳理《红楼梦》阅读抓手。"; points=@(
    @("先看家族结构","阅读《红楼梦》要先把人物放进贾府结构。可抓贾母为中心的长辈线、宝黛钗为中心的青年线、王熙凤和探春等管理线。"),
    @("宝黛钗体现价值冲突","宝玉重真情，黛玉追求精神共鸣，宝钗稳重周全。三人关系不只是爱情选择，也呈现真情与礼法、个性与家族秩序的冲突。"),
    @("人物对照帮助理解主题","黛玉与宝钗、晴雯与袭人、探春与迎春，都可对照阅读。答题要结合具体情节，不要只背性格标签。")
  )},
  @{ section="mingzhu"; slug="xiangtu-zhongguo-gainian"; title="《乡土中国》核心概念"; tags=@("名著","乡土中国","核心概念","整本书阅读"); summary="用学生易理解的方式梳理《乡土中国》的差序格局、礼治秩序等概念。"; points=@(
    @("读这本书要抓概念","《乡土中国》不是情节型作品，复习重点在概念。每个概念都可理解为解释社会现象的工具。"),
    @("差序格局是重点","差序格局像水波纹，以自己为中心向外推开，亲疏远近不同，责任和情感也不同。它帮助理解熟人社会的人情关系。"),
    @("礼治秩序要联系现实","礼治依靠习惯、人情和伦理维持秩序，不等于没有规则。复习时可按概念、解释、生活例子、现实启示四栏整理。")
  )},
  @{ section="mingzhu"; slug="biancheng-renwu-xingxiang"; title="《边城》人物形象"; tags=@("名著","边城","人物形象","沈从文"); summary="围绕翠翠、祖父、傩送等人物，分析《边城》的纯美人性与命运感。"; points=@(
    @("从人物看湘西世界","《边城》人物不多，但承载着湘西世界的淳朴气质。分析时既要看善良纯真，也要看命运无常带来的淡淡悲凉。"),
    @("翠翠代表纯真与等待","翠翠天真、敏感、羞涩，对爱情有朦胧期待。她的形象体现自然生长的纯净情感，也承受着现实误会和命运不确定。"),
    @("祖父与傩送各有意义","祖父象征守护和温厚，也有面对命运的无力；傩送真诚重情，却被兄弟关系和现实变故阻隔。人物共同构成作品的纯美与遗憾。")
  )},
  @{ section="beike"; slug="bixiu-shang-danyi-xuean"; title="必修上第一单元学案"; tags=@("备课","学案","必修上","课堂设计"); summary="围绕青春价值与文学阅读，设计必修上第一单元的学习任务和课堂活动。"; points=@(
    @("单元目标要清楚","必修上第一单元适合引导学生思考青春、理想、责任与生命姿态。学案目标可设为读懂青春形象、品味表达方式、完成成长主题写作。"),
    @("课前任务要轻量","让学生圈画体现青春姿态的语句，写下一个青春关键词，再准备一则青年担当素材。任务不宜过重，重点是带着问题进课堂。"),
    @("课堂活动重迁移","可用关键词共读、表达方式品读、小组迁移分析等方式推进。课后短写作可设置「写给一年后的自己」，让教材阅读连接真实表达。")
  )},
  @{ section="beike"; slug="yuekao-zuowen-jiangping"; title="月考作文讲评课件说明"; tags=@("备课","作文讲评","月考","课堂设计"); summary="提供月考作文讲评课的结构说明，强调审题、结构、素材转化和升格训练。"; points=@(
    @("讲评课不是公布分数","月考作文讲评应帮助学生知道下一次如何改进。课件可围绕审题、结构、论证、语言四个问题展开。"),
    @("先回题目再看范文","讲评课第一步应重新读题，圈出材料关键词和任务要求。先让学生明白偏题从哪里发生，再展示典型片段。"),
    @("片段升格最有效","选择典型论证段，隐去个人信息后进行补观点、压素材、加分析、回扣题目的修改训练。讲评课最后要有即时改写输出。")
  )},
  @{ section="beike"; slug="wenyan-fanyi-zhuanti-lianxi"; title="文言文翻译专题练习"; tags=@("备课","文言文","翻译","练习"); summary="设计文言翻译专题练习的课堂流程，突出关键词、句式和规范表达。"; points=@(
    @("专题课聚焦得分点","文言翻译专题练习要围绕重要实词、关键虚词、特殊句式、省略成分和语序调整，不宜只堆大量句子。"),
    @("课堂流程可四步走","先教师示范圈点，再小组合作翻译，再比较不同译文，最后归纳留、换、补、调。学生要看到翻译是有证据的处理过程。"),
    @("评价标准要明确","可按关键词是否准确、句式是否落实、表达是否通顺三项评价。长期训练后，学生会从猜大意转向分析句子。")
  )}
)

function Escape-Html([string]$Value) {
  if ($null -eq $Value) { return "" }
  return $Value.Replace("&","&amp;").Replace("<","&lt;").Replace(">","&gt;").Replace('"',"&quot;")
}

function Render-Header([string]$Active) {
  $prefix = "../../"
  $items = @(
    @("zuowen","作文专区","zuowen.html"), @("wenyan","文言文研习","wenyan.html"),
    @("shici","诗词曲赋","shici.html"), @("yuedu","现代文阅读","yuedu.html"),
    @("mingzhu","名著导读","mingzhu.html"), @("cards","素材卡片墙","pages/writing-cards-week20.html"),
    @("beike","备课资源","beike.html"), @("study","学习路径","study-guide.html"),
    @("updates","更新日志","updates.html"), @("about","关于师者","about.html"),
    @("search","搜索资料","search.html"), @("favorites","我的收藏","favorites.html")
  )
  $links = ($items | ForEach-Object {
    $cls = if ($_[0] -eq $Active) { ' class="active"' } else { "" }
    "<a$cls href=""$prefix$($_[2])"">$($_[1])</a>"
  }) -join ""
  return "<header class=""site-header""><nav class=""nav""><a class=""brand"" href=""${prefix}index.html""><span class=""seal"">文</span><span class=""brand-title"">孤登塔客语文馆</span></a><div class=""nav-links"">$links</div></nav></header>"
}

function Render-Body($Article) {
  $parts = New-Object System.Collections.Generic.List[string]
  foreach ($point in $Article.points) {
    $parts.Add("        <h2>$(Escape-Html $point[0])</h2>") | Out-Null
    $main = $point[1]
    $extend = "学习时要把这一点放回具体文本或题目中，不背空泛结论。课堂整理可采用「现象—方法—表达」的顺序：先说明材料或题目呈现了什么，再写解决路径，最后形成可以迁移到答题或写作中的表达。这样处理，资料才会从参考材料变成真正属于自己的学习工具。"
    $parts.Add("        <p>$(Escape-Html $main)</p>") | Out-Null
    $parts.Add("        <p>$(Escape-Html $extend)</p>") | Out-Null
  }
  return ($parts -join "`n")
}

function Render-Article($Article) {
  $prefix = "../../"
  $category = $SectionNames[$Article.section]
  $url = "articles/$($Article.section)/$($Article.slug).html"
  $tags = ($Article.tags | ForEach-Object { "<span>$(Escape-Html $_)</span>" }) -join ""
  $body = Render-Body $Article
  $header = Render-Header $Article.section
  $footer = '<footer class="site-footer"><div class="footer-inner"><div><h2>教师简介</h2><p>高中一线语文教师，持续整理适合课堂与自学使用的语文资料。</p></div><div><h2>教学寄语</h2><p>愿每一次阅读，都能照见更辽阔的精神世界；愿每一篇文字，都有真实思考与真诚性情。</p></div></div></footer>'
@"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="$(Escape-Html $Article.summary)">
  <title>$(Escape-Html $Article.title)｜孤登塔客语文馆</title>
  <link rel="stylesheet" href="${prefix}css/styles.css">
</head>
<body>
  $header
  <main>
    <article class="article-page" data-reader-article data-title="$(Escape-Html $Article.title)" data-column="$(Escape-Html $category)" data-date="$Date" data-url="$(Escape-Html $url)">
      <div class="breadcrumb"><a href="${prefix}index.html">首页</a> / <a href="${prefix}$($SectionLinks[$Article.section])">$(Escape-Html $category)</a> / 正文</div>
      <header class="article-hero">
        <p class="eyebrow">资料文章 · $(Escape-Html $category)</p>
        <h1>$(Escape-Html $Article.title)</h1>
        <p>$(Escape-Html $Article.summary)</p>
        <div class="article-meta"><span>更新：$Date</span><span>栏目：$(Escape-Html $category)</span></div>
        <div class="data-tags">$tags</div>
        <div class="article-actions"><button class="read-link favorite-button" type="button" data-favorite-button>收藏本文</button><a class="read-link" href="${prefix}favorites.html">我的收藏</a></div>
      </header>
      <aside class="article-toc" data-article-toc></aside>
      <div class="article-content">
$body
      </div>
      <section class="recent-panel"><div class="section-heading"><h2>最近浏览</h2><p>保存在当前浏览器中，方便继续阅读。</p></div><div class="recent-list" data-recent-articles></div></section>
    </article>
  </main>
  $footer
  <script src="${prefix}js/reader-tools.js"></script>
</body>
</html>
"@
}

$Records = foreach ($article in $Articles) {
  $dir = Join-Path $ArticleRoot $article.section
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $html = Render-Article $article
  [System.IO.File]::WriteAllText((Join-Path $dir "$($article.slug).html"), $html, [System.Text.Encoding]::UTF8)
  [pscustomobject]@{
    title = $article.title
    section = $article.section
    category = $SectionNames[$article.section]
    tags = $article.tags
    summary = $article.summary
    date = $Date
    url = "articles/$($article.section)/$($article.slug).html"
  }
}

New-Item -ItemType Directory -Force -Path $DataRoot | Out-Null
$json = $Records | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText((Join-Path $DataRoot "articles.json"), $json, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText((Join-Path $DataRoot "search-index.json"), $json, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText((Join-Path $DataRoot "articles-data.js"), "window.GDTK_ARTICLES = $json;`n", [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText((Join-Path $DataRoot "search-index-data.js"), "window.GDTK_SEARCH_INDEX = $json;`n", [System.Text.Encoding]::UTF8)

Write-Host "已生成 $($Records.Count) 篇文章，并更新 articles/search 索引。"
