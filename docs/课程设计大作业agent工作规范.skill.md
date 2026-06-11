---
name: course-design-final-project-agent
description: 用于课程设计大作业的 Agent 工作规范。适用于整理课程设计仓库、撰写最终报告 txt、维护章节化文档、补齐 UML 图源、规划截图清单、审计报告口径、生成答辩材料、对齐课程模板和最高标准交付。
---

# 课程设计大作业 Agent 工作规范

## 适用场景

当用户要求处理课程设计大作业、移动应用开发课程报告、HarmonyOS 课程设计、最终报告、答辩材料、截图清单、UML 图、过程文档、课程模板对齐、报告扩写、Markdown 语法清理、txt 纯文本报告维护时，使用本规范。

本规范的目标是让 Agent 在课程设计项目中稳定完成三类工作：第一，保持仓库文档结构清楚；第二，保持最终报告口径统一、内容充足、符合课程要求；第三，保证截图、UML、报告正文、验收记录之间能够互相追溯。

## 总原则

课程设计大作业优先按“正式课程交付物”处理，而不是按临时代码说明处理。Agent 输出的文档必须能够直接服务于老师检查、课堂答辩、最终报告排版和小组成员分工说明。

报告正文必须以课程要求和实际交付系统为中心。不要在报告中暴露与课程无关的历史技术路线、临时原型、辅助验证路径或内部迁移过程。老师只需要看到最终系统、开发技术、功能实现、设计过程和测试结果。

最终报告 txt 文件必须保持纯文本风格。不要使用 Markdown 标题符号、Markdown 列表、代码块、行内代码、Markdown 链接或表格语法。报告中的章节编号可以使用“第一章”“1.1”“4.12”这类传统报告格式。

四人小组项目的报告内容必须充分。不要只写功能点罗列，要补充背景、意义、需求、可行性、架构、模块、数据设计、流程设计、实现说明、测试方法、小组分工、不足与展望。

## 当前推荐目录结构

课程设计文档优先放在 docs 目录下，并按阶段组织。

docs/01-resource 用于保存课程要求、模板、参考资料和提交格式说明。

docs/02-process 用于保存过程材料，包括分析设计、截图清单、UML 源文件、章节化报告底稿、脚本和过程记录。

docs/02-process/document/report-txt 用于维护最终报告纯文本底稿。

docs/02-process/document/report-txt/chapters 用于维护分章 txt。每章单独维护，便于 Agent 扩写、审计和局部修改。

docs/02-process/document/report-txt/00-report-master.txt 是装配后的总稿。它应由章节文件生成，避免手工长期维护两份内容。

docs/02-process/Figure 用于维护报告图片材料。

docs/02-process/Figure/uml-sources 用于保存 PlantUML 或其他 UML 图源文件。

docs/02-process/Figure/screenshots 用于保存界面 UI 截图。

docs/02-process/Figure/pdf-pages 用于保存 PDF 渲染页截图或报告排版检查图片。

docs/02-process/Figure/screenshot-checklist.txt 用于登记报告需要的界面截图。

docs/02-process/Figure/screenshot-capture-script.txt 用于指导人工在 DevEco Studio Previewer 或真机环境中逐张补图。

docs/02-process/script 用于保存文档装配、截图占位检查、字数统计、目录完整性检查等辅助脚本。

docs/03-report 用于保存最终提交产物，例如 docx、pdf、系统压缩包、最终报告导出文件。

archive 目录只放历史材料、废弃草稿和不进入最终口径的参考内容。

## 报告口径规范

报告正文统一描述为完整课程设计系统的开发过程。对于 HarmonyOS 课程设计项目，正文应写成“采用 HarmonyOS NEXT、ArkTS、ArkUI、RdbStore、DevEco Studio 完成原生移动应用开发”。

不要在最终报告正文、截图清单、答辩稿中出现以下口径：Web、React、Vite、Flutter、Playwright、跨平台、原型、迁移、从某版本改造、临时退守方案。除非用户明确要求写内部技术复盘，否则这些内容应留在内部过程文档或归档材料中。

如果项目确实曾使用其他技术做验证，最终课程报告也应聚焦最终交付系统。可以写“系统经过多轮迭代后形成当前实现”，不要写“从 Web 原型迁移到 HarmonyOS”。

报告可以强调系统特色，例如 GTD 清单、四象限优先级、番茄钟、项目阶段、回收箱、备份恢复和通知中心。但所有特色必须服务于课程题目和学生日程管理场景。

## 报告章节规范

推荐使用传统五章结构。

第一章 引言。说明项目背景、项目意义、项目目标、小组分工和本章小结。

第二章 相关技术介绍。说明 HarmonyOS NEXT、ArkTS、ArkUI、RdbStore、本地通知、JSON 备份、DevEco Studio、测试方法等。

第三章 系统分析与设计。说明需求分析、可行性分析、总体架构、用例设计、功能模块、活动流程、状态设计、数据库设计、时序设计和本章小结。

第四章 系统实现。说明工程结构、入口导航、模型、首页、详情表单、日历、提醒、番茄钟、项目、个人中心、备份恢复、测试验收和本章小结。

第五章 项目总结与展望。说明完成情况、小组协作、项目不足、改进方向、心得体会和本章小结。

每章应独立可读。不要让章节只剩提纲。每个核心功能至少写清楚“用户如何使用、系统如何保存、页面如何联动、验收如何证明”。

## 章节化 txt 维护规范

优先修改 chapters 目录下的分章 txt 文件，再运行装配脚本生成总稿。

不要只改 00-report-master.txt 后忘记同步分章源文件。总稿是派生文件，分章文件才是长期维护入口。

分章 txt 应保持纯文本报告风格。可以使用中文章节号和小节号，例如“第四章 系统实现”“4.4 首页看板实现”。

不使用 Markdown 的井号标题，不使用短横线列表，不使用星号加粗，不使用代码围栏，不使用 Markdown 链接。

章节扩写时优先补“软件工程解释”，包括为什么这样设计、模块之间如何协作、数据怎样流转、异常情况如何处理、测试如何覆盖。

## Figure 与截图规范

Figure 目录必须同时维护 UML 图源和界面截图证据。UML 图用于说明设计，UI 截图用于证明系统可运行。

screenshot-checklist.txt 是截图总账。报告正文中每一个“截图位置：Sxx-HarmonyOS-xxx”都必须在清单中存在。清单中的每一个 Sxx 也必须出现在报告正文中。

截图编号建议使用 S01、S02、S03 递增。截图名建议使用英文短横线文件名，例如 screenshots/S01-home-dashboard.png。

截图清单每项至少包含：编号、报告位置、对应图名、建议文件、截图内容、验收目的、状态。

截图执行脚本清单应写明人工操作路径，便于后续在 Windows DevEco Studio Previewer 或真机环境中补图。

报告正文中的 UI 截图位置建议写成两行。

截图位置：S01-HarmonyOS-首页看板，建议文件：screenshots/S01-home-dashboard.png。
图10：系统首页看板界面截图

UML 图源文件放在 uml-sources 目录，文件名用编号加英文说明，例如 01-system-architecture.puml。图源标题要与报告图名一致。

图号必须按正文出现顺序递增。不要出现图12 之后又出现图10 的情况。

## UML 图规范

课程设计报告至少建议准备以下 UML 或结构图。

图1：系统总体架构图。

图2：系统用例图。

图3：系统功能模块图。

图4：日程创建与提醒设置活动图。

图5：日程任务状态图。

图6：系统数据库 ER 图。

图7：日程编辑保存时序图。

图8：番茄钟结算时序图。

图9：工程目录结构图。

后续可根据实现章节继续插入提醒交互图、备份恢复流程图、页面截图和验收截图。

UML 图应服务正文说明，不要为了堆数量而放无关图。每张图前后都要有文字解释它说明什么。

## UI 截图建议清单

高标准课程设计建议至少保留以下 UI 截图位置。

S01-HarmonyOS-首页看板。证明启动加载、首页任务、用户信息、经验值和番茄数。

S02-HarmonyOS-日程详情表单。证明日程添加和编辑字段完整。

S03-HarmonyOS-日历视图。证明按日期查看日程。

S04-HarmonyOS-提醒设置与通知中心。证明提醒设置和应用内通知闭环。

S05-HarmonyOS-番茄钟专注页。证明任务进入专注执行。

S06-HarmonyOS-番茄钟结算奖励。证明经验值、番茄数和任务实际番茄数写回。

S07-HarmonyOS-项目阶段管理。证明长期项目和阶段推进能力。

S08-HarmonyOS-个人中心与回收箱。证明逻辑删除、恢复和个人统计。

S09-HarmonyOS-备份恢复入口。证明备份恢复能力有界面入口。

S10-HarmonyOS-搜索与过滤结果。证明多日程场景下快速定位。

S11-HarmonyOS-重启恢复证据。证明本地持久化有效。

S12-HarmonyOS-人工走查通过记录。证明测试用例和截图材料形成闭环。

## 审计命令规范

报告改动后必须做 Markdown 语法残留审计。

rg -n '(^#{1,6}\s|^[*-]\s|^\d+\.\s|\*\*|```|`[^`]+`|\[[^\]]+\]\([^\)]+\))' docs/02-process/document/report-txt

报告改动后必须做敏感口径审计。

rg -n 'Web|React|Vite|原型|跨平台|Flutter|Playwright|TypeScript|阶段迁移|迁移' docs/02-process/document/report-txt docs/02-process/Figure/screenshot-checklist.txt docs/02-process/Figure/screenshot-capture-script.txt

截图占位改动后必须做截图一致性审计。

bash docs/02-process/script/check_screenshot_placeholders.sh

章节文件改动后必须重新装配总稿。

bash docs/02-process/script/assemble_report_txt.sh

图号改动后建议检查正文图名顺序。

rg -n '^图[0-9]+：|^截图位置：S[0-9]+' docs/02-process/document/report-txt/00-report-master.txt

篇幅检查可使用。

wc -l docs/02-process/document/report-txt/00-report-master.txt docs/02-process/document/report-txt/chapters/*.txt

## Agent 工作流程

进入项目后，先读取 Agent.md、context/context.txt、docs/01-resource 中的课程要求、docs/02-process/Figure/README.txt、当前报告章节文件和截图清单。

处理报告时，先判断用户要求属于哪一类：扩写正文、调整口径、补 UML、补截图清单、生成答辩稿、审计格式、对齐课程模板。

如果是扩写正文，优先修改对应章节 txt，再运行装配脚本。

如果是新增界面截图，必须同时修改报告正文、screenshot-checklist.txt 和 screenshot-capture-script.txt。

如果是新增 UML 图，必须同时新增 uml-sources 图源文件，并在报告正文插入对应图名。

如果是修改图号，必须检查报告正文、截图清单、UML 图源标题是否一致。

如果是最终交付前检查，必须执行 Markdown 语法审计、敏感口径审计、截图占位一致性审计、图号顺序检查和 git status。

## 交付口径

Agent 最终回复应简洁说明改了哪些文件、通过了哪些检查、还有哪些需要人工补充。不要让用户手动复制文件，因为用户和 Agent 在同一工作区。

如果截图尚未真实补齐，要明确说“截图位置和采集清单已对齐，实际 PNG 仍需在 DevEco Studio Previewer 或真机环境中补图”。

如果某些系统功能在代码侧尚未实现，报告可以保留设计说明和截图位置，但最终答辩前必须回到业务代码侧补齐，避免报告超过实际系统。

## 最低交付检查清单

总报告存在，路径为 docs/02-process/document/report-txt/00-report-master.txt。

分章文件存在，路径为 docs/02-process/document/report-txt/chapters。

装配脚本存在，路径为 docs/02-process/script/assemble_report_txt.sh。

截图清单存在，路径为 docs/02-process/Figure/screenshot-checklist.txt。

截图执行清单存在，路径为 docs/02-process/Figure/screenshot-capture-script.txt。

截图占位检查脚本存在，路径为 docs/02-process/script/check_screenshot_placeholders.sh。

UML 图源存在，路径为 docs/02-process/Figure/uml-sources。

报告正文没有 Markdown 语法残留。

报告正文没有暴露课程无关技术路线。

报告图号顺序递增。

报告中的截图位置与 screenshot-checklist.txt 完全一致。

最终回复写清楚验证结果和剩余人工事项。
