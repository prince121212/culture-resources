/**
 * 生成分类导入模板的Excel文件
 */
export const generateCategoryTemplate = () => {
  // 创建Excel内容的HTML表格格式
  const headers = ['分类名称', '描述', '父分类名称', '排序'];
  const sampleData = [
    ['文学', '文学类资源', '', '1'],
    ['小说', '小说类文学作品', '文学', '1'],
    ['诗歌', '诗歌类文学作品', '文学', '2'],
    ['科技', '科技类资源', '', '2'],
    ['人工智能', 'AI相关资源', '科技', '1'],
    ['编程', '编程相关资源', '科技', '2'],
    ['艺术', '艺术类资源', '', '3'],
    ['绘画', '绘画相关资源', '艺术', '1'],
    ['音乐', '音乐相关资源', '艺术', '2'],
    ['教育', '教育类资源', '', '4'],
  ];

  // 创建Excel格式的HTML内容
  const excelContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>分类导入模板</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    </head>
    <body>
      <table border="1">
        <tr style="background-color: #f0f0f0; font-weight: bold;">
          ${headers.map(header => `<td>${header}</td>`).join('')}
        </tr>
        ${sampleData.map(row =>
          `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
        ).join('')}
      </table>
    </body>
    </html>
  `;

  // 创建Blob并下载
  const blob = new Blob([excelContent], {
    type: 'application/vnd.ms-excel;charset=utf-8;'
  });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', '分类导入模板.xls');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * 生成CSV格式的模板文件（备用方案）
 */
export const generateCategoryTemplateCSV = () => {
  const headers = ['分类名称', '描述', '父分类名称', '排序'];
  const sampleData = [
    ['文学', '文学类资源', '', '1'],
    ['小说', '小说类文学作品', '文学', '1'],
    ['诗歌', '诗歌类文学作品', '文学', '2'],
    ['科技', '科技类资源', '', '2'],
    ['人工智能', 'AI相关资源', '科技', '1'],
    ['编程', '编程相关资源', '科技', '2'],
    ['艺术', '艺术类资源', '', '3'],
    ['绘画', '绘画相关资源', '艺术', '1'],
    ['音乐', '音乐相关资源', '艺术', '2'],
    ['教育', '教育类资源', '', '4'],
  ];

  // 创建CSV内容
  const csvContent = [headers, ...sampleData]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  // 添加BOM以支持中文
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', '分类导入模板.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * 生成标签导入模板的Excel文件
 */
export const generateTagTemplate = () => {
  // 创建Excel内容的HTML表格格式
  const headers = ['标签名称', '描述'];
  const sampleData = [
    ['流行', '流行文化相关内容'],
    ['古代', '古代历史文化内容'],
    ['现代', '现代文化内容'],
    ['学术', '学术研究相关内容'],
    ['教育', '教育教学相关内容'],
    ['娱乐', '娱乐休闲相关内容'],
    ['科技', '科技创新相关内容'],
    ['艺术', '艺术创作相关内容'],
  ];

  // 创建Excel格式的HTML内容
  const excelContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>标签导入模板</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    </head>
    <body>
      <table border="1">
        <tr style="background-color: #f0f0f0; font-weight: bold;">
          ${headers.map(header => `<td>${header}</td>`).join('')}
        </tr>
        ${sampleData.map(row =>
          `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
        ).join('')}
      </table>
    </body>
    </html>
  `;

  // 创建Blob并下载
  const blob = new Blob([excelContent], {
    type: 'application/vnd.ms-excel;charset=utf-8;'
  });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', '标签导入模板.xls');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * 生成标签CSV模板文件
 */
export const generateTagTemplateCSV = () => {
  const headers = ['标签名称', '描述'];
  const sampleData = [
    ['流行', '流行文化相关内容'],
    ['古代', '古代历史文化内容'],
    ['现代', '现代文化内容'],
    ['学术', '学术研究相关内容'],
    ['教育', '教育教学相关内容'],
    ['娱乐', '娱乐休闲相关内容'],
    ['科技', '科技创新相关内容'],
    ['艺术', '艺术创作相关内容'],
  ];

  // 创建CSV内容
  const csvContent = [headers, ...sampleData]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  // 添加BOM以支持中文
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', '标签导入模板.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * 下载静态模板文件
 */
export const downloadStaticTemplate = (type: 'excel' | 'csv', templateType: 'category' | 'tag' = 'category') => {
  if (templateType === 'tag') {
    // 对于标签，使用动态生成的方式
    if (type === 'excel') {
      generateTagTemplate();
    } else {
      generateTagTemplateCSV();
    }
    return;
  }

  // 对于分类，也使用动态生成的方式
  if (type === 'excel') {
    generateCategoryTemplate();
  } else {
    generateCategoryTemplateCSV();
  }
};