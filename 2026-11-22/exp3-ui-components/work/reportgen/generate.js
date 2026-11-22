const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType,
  HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle
} = require('docx');

const shots = 'D:/Users/jin/AndroidStudioProjects/AndroidExp03/2026-11-22/exp3-ui-components/outputs/screenshots';
const outFile = 'D:/Users/jin/AndroidStudioProjects/AndroidExp03/2026-11-22/exp3-ui-components/outputs/实验3_Android界面组件_实验报告.docx';

const p = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, bold: opts.bold, size: opts.size || 21, color: opts.color })],
  spacing: { after: opts.after === undefined ? 100 : opts.after, line: 320 },
  alignment: opts.align,
  indent: opts.indent,
});

const bullet = (text) => new Paragraph({
  children: [new TextRun({ text, size: 21 })],
  bullet: { level: 0 },
  spacing: { after: 60, line: 300 },
});

const heading = (text, level = 1) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: level === 1 ? 28 : 24, color: '1A237E' })],
  heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
  spacing: { before: 240, after: 120 },
});

const image = (file, caption, width = 250) => [
  new Paragraph({
    children: [new ImageRun({
      type: 'png',
      data: fs.readFileSync(path.join(shots, file)),
      transformation: { width, height: Math.round(width * 2400 / 1080) },
    })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 40 },
  }),
  new Paragraph({
    children: [new TextRun({ text: caption, size: 18, color: '666666' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
  }),
];

const codeLine = (text) => new Paragraph({
  children: [new TextRun({ text, font: 'Consolas', size: 18 })],
  spacing: { after: 20, line: 260 },
  indent: { left: 240 },
});

const children = [];

children.push(new Paragraph({
  children: [new TextRun({ text: 'Android 界面组件实验', bold: true, size: 44, color: '1A237E' })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 600, after: 100 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: '实验 3 · 实验报告', size: 28, color: '555555' })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 500 },
}));

const infoRows = [
  ['课程名称', 'Android 应用开发'],
  ['实验名称', 'Android 界面组件实验（实验3）'],
  ['工程名称', 'AndroidExp03'],
  ['包名 / 应用 ID', 'com.fjnu.jin / com.fjnu.jin.exp03'],
  ['姓名 / 学号 / 班级', '（请填写）'],
  ['实验日期', '2026-11-22'],
];
children.push(new Table({
  width: { size: 78, type: WidthType.PERCENTAGE },
  rows: infoRows.map(([k, v]) => new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        children: [p(k, { bold: true, size: 20 })],
      }),
      new TableCell({ children: [p(v, { size: 20 })] }),
    ],
  })),
}));

children.push(heading('一、实验目的'));
children.push(bullet('掌握 ListView 与 SimpleAdapter 的使用方法，能够自定义列表项布局并展示图文数据。'));
children.push(bullet('掌握 AlertDialog 的用法，能够通过自定义布局创建个性化对话框。'));
children.push(bullet('掌握使用 XML 定义选项菜单（Options Menu）及菜单项事件处理。'));
children.push(bullet('掌握上下文操作模式（ActionMode）菜单的创建与多选删除操作。'));
children.push(bullet('掌握 RecyclerView、Adapter 与 ViewHolder 的使用，能够动态更新列表并保证滚动、点击正确。'));

children.push(heading('二、实验环境'));
children.push(bullet('开发工具：Android Studio；构建工具：Gradle 9.6.0 + AGP 9.5.1。'));
children.push(bullet('语言与 SDK：Kotlin 2.2.10；compileSdk 37、minSdk 24、targetSdk 37。'));
children.push(bullet('运行环境：Android 模拟器 Medium_Phone_API_37.0（1080×2400）。'));
children.push(bullet('主要依赖：androidx.recyclerview:recyclerview:1.4.0（其余界面均为系统 View 组件）。'));

children.push(heading('三、实验内容与实现结果'));

children.push(heading('1. Android ListView 的用法（SimpleAdapter）', 2));
children.push(p('实验要求：利用 SimpleAdapter 实现如图界面；注意列表项布局；图片使用附件资源；使用 Toast 显示选中的列表项信息；单击列表项后发送一条通知，通知图标为应用程序图标，Title 为列表项内容，内容自拟。'));
children.push(p('实现要点：'));
children.push(bullet('列表项布局 item_animal.xml 采用水平 LinearLayout：左侧 TextView 显示动物名称，右侧 ImageView 显示图片（56dp，centerCrop）。'));
children.push(bullet('数据为 List<Map<String, Object>>，通过 SimpleAdapter 绑定 item_animal.xml 中的 tvName 与 ivIcon。'));
children.push(bullet('单击列表项时将其设为选中（ListView 单选模式），选中行以深红色高亮、文字变白，同时弹出 Toast 显示“你选中了：xxx”。'));
children.push(bullet('通过 NotificationCompat 发送通知：smallIcon 使用应用图标的机器人前景图，contentTitle 为列表项文字，正文为“已点击列表中的 xxx，这是一条来自实验3的通知”。'));
children.push(bullet('Android 13 及以上动态申请 POST_NOTIFICATIONS 权限，并创建通知渠道。'));
children.push(...image('03_listview_toast.png', '图 1  点击列表项：选中行高亮并弹出 Toast'));
children.push(...image('04_notification.png', '图 2  点击列表项后发送的通知（标题为列表项内容）'));

children.push(heading('2. 创建自定义布局的 AlertDialog', 2));
children.push(p('实验要求：创建一个如图所示的自定义布局，并调用 AlertDialog.Builder 对象的 setView() 将布局添加到 AlertDialog。'));
children.push(p('实现要点：'));
children.push(bullet('自定义布局 dialog_login.xml：橙色标题栏“ANDROID APP”、Username / Password 两个 EditText、底部 Cancel 与 Sign in 两个按钮。'));
children.push(bullet('使用 AlertDialog.Builder(this).setView(content).create() 装载布局并显示。'));
children.push(bullet('Cancel 关闭对话框；Sign in 校验输入，为空时提示“请输入用户名和密码”，否则以 Toast 提示登录成功并关闭对话框。'));
children.push(...image('06_dialog.png', '图 3  通过 setView() 加载的自定义登录对话框'));

children.push(heading('3. 使用 XML 定义菜单', 2));
children.push(p('实验要求：使用 XML 定义菜单；字体大小包含小、中、大 3 个选项，分别对应 10 号、16 号、20 号字；普通菜单项点击后弹出 Toast；字体颜色包含红色、黑色 2 个选项。'));
children.push(p('实现要点：'));
children.push(bullet('菜单资源 res/menu/menu_xml.xml 定义“字体大小”（含子菜单小/中/大）、“普通菜单项”、“字体颜色”（含子菜单红色/黑色）。'));
children.push(bullet('该 Activity 使用带 ActionBar 的主题，在 onCreateOptionsMenu() 中 inflate 菜单；在 onOptionsItemSelected() 中处理各菜单项。'));
children.push(bullet('字号分别设置为 10sp / 16sp / 20sp；颜色分别设置为红色与黑色；普通菜单项弹出 Toast。'));
children.push(...image('08_menu_open.png', '图 4  XML 定义的选项菜单（溢出菜单）'));
children.push(...image('10_menu_large.png', '图 5  选择“字体大小 → 大”后测试文本变为 20sp'));
children.push(...image('12_menu_red.png', '图 6  选择“字体颜色 → 红色”后测试文本变红'));

children.push(heading('4. 创建上下文操作模式（ActionMode）的上下文菜单', 2));
children.push(p('实验要求：使用 ListView 创建列表，为 List Item 创建 ActionMode 形式的上下文菜单（参考 MENU 设计）。'));
children.push(p('实现要点：'));
children.push(bullet('通过 ListView 展示 One~Five 五项（左侧应用图标、右侧名称）。'));
children.push(bullet('长按列表项调用 startActionMode() 进入上下文操作模式；ActionMode 菜单由 menu_context.xml 定义，仅含“删除”项并以 always 方式显示删除图标。'));
children.push(bullet('上下文操作模式内点击其它列表项可切换选中状态，标题实时显示“N selected”，选中行蓝色高亮并显示勾选标记。'));
children.push(bullet('点击删除图标移除所有选中项、刷新列表并退出上下文操作模式，同时以 Toast 提示删除数量。'));
children.push(...image('14b_action_mode_two.png', '图 7  长按进入 ActionMode 并多选（2 selected）'));
children.push(...image('15_action_mode_deleted.png', '图 8  删除选中项后的列表与 Toast 提示'));

children.push(heading('5. 使用 RecyclerView 实现列表视图效果', 2));
children.push(p('实验要求：使用原动物图片资源，列表项包含图片、名称；使用 RecyclerView、Adapter 与 ViewHolder 展示数据；单击显示名称，增加一条记录后列表立即更新；验证滚动正常、点击对象正确、更新后无错位。'));
children.push(p('实现要点：'));
children.push(bullet('列表项 item_recycler.xml：左侧 48dp 圆形裁切图片，右侧名称 TextView。'));
children.push(bullet('自定义 AnimalAdapter 继承 RecyclerView.Adapter<AnimalViewHolder>，在 onCreateViewHolder() 中加载布局、在 onBindViewHolder() 中绑定图片与名称，使用 ViewHolder 缓存控件。'));
children.push(bullet('LinearLayoutManager + DividerItemDecoration 实现纵向列表与分割线。'));
children.push(bullet('点击名称时向数据集合追加一条“名称（副本 N）”记录，调用 notifyItemInserted() 局部刷新并 scrollToPosition() 滚动到新记录；用 bindingAdapterPosition 取当前位置，避免错位。'));
children.push(...image('16_recycler.png', '图 9  RecyclerView 动物列表'));
children.push(...image('17_recycler_added.png', '图 10  点击 Tiger 名称后新增记录“Tiger（副本 1）”，列表立即更新'));

children.push(heading('四、工程结构与关键文件'));
const files = [
  ['MainActivity.kt', '首页入口，跳转 5 个实验'],
  ['ListViewActivity.kt', '实验1：SimpleAdapter、Toast、通知'],
  ['DialogActivity.kt', '实验2：自定义布局 AlertDialog'],
  ['MenuXmlActivity.kt', '实验3：XML 菜单与字号/颜色处理'],
  ['ActionModeActivity.kt', '实验4：ActionMode 多选删除'],
  ['RecyclerActivity.kt', '实验5：RecyclerView + Adapter + ViewHolder'],
  ['res/layout/*.xml', '首页、各实验页面、列表项与对话框布局'],
  ['res/menu/menu_xml.xml、menu_context.xml', '选项菜单与上下文菜单定义'],
  ['res/drawable-nodpi/animal_*.png', '6 张动物图片资源'],
];
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      children: [
        new TableCell({ children: [p('文件', { bold: true, size: 19 })] }),
        new TableCell({ children: [p('作用', { bold: true, size: 19 })] }),
      ],
    }),
    ...files.map(([f, d]) => new TableRow({
      children: [
        new TableCell({ children: [p(f, { size: 19 })] }),
        new TableCell({ children: [p(d, { size: 19 })] }),
      ],
    })),
  ],
}));

children.push(heading('五、问题与说明'));
children.push(bullet('报告要求“图片使用 QQ 群附件资源”，但本次未随报告提供附件图片，工程中暂用本地生成的动物图片（res/drawable-nodpi/animal_*.png）占位；替换同名文件即可换成群附件图片，无需改动代码。'));
children.push(bullet('同一模拟器上存在其它实验工程使用相同应用 ID（com.fjnu.jin），为避免安装覆盖，本工程将 applicationId 设为 com.fjnu.jin.exp03，namespace 仍为 com.fjnu.jin，不影响功能与代码结构。'));
children.push(bullet('Android 13+ 通知需运行时权限，首次点击列表项时若未授权会提示“未授予通知权限”；实验中已通过系统授权对话框/命令完成授权。'));

children.push(heading('六、实验总结'));
children.push(p('通过本次实验，完成了 ListView+SimpleAdapter、自定义 AlertDialog、XML 选项菜单、ActionMode 上下文菜单以及 RecyclerView 五个界面组件的实践。掌握了 Adapter 数据绑定、菜单资源定义与事件分发、上下文操作模式的生命周期，以及 RecyclerView 的 ViewHolder 复用与局部刷新机制。所有功能均已在模拟器上运行验证：列表点击与高亮正确、通知正常发出、对话框可正常输入与关闭、菜单字号与颜色即时生效、ActionMode 多选删除正常、RecyclerView 新增记录后立即更新且无错位。'));

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Microsoft YaHei', size: 21 } },
    },
  },
  sections: [{
    properties: {
      page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } },
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outFile, buf);
  console.log('written', outFile, buf.length);
});
