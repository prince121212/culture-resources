/**
 * 通用端口释放脚本
 * 用法: node scripts/kill-port.js [端口号]
 * 默认端口: 5001
 */

const { exec } = require('child_process');
const os = require('os');

// 获取端口号参数，默认为5001
const PORT = process.argv[2] || 5001;

// 彩色日志
const log = {
  info: (msg) => console.log(`\x1b[36m[信息]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[成功]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[警告]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[错误]\x1b[0m ${msg}`)
};

// 检查端口是否被占用
function checkPort() {
  return new Promise((resolve) => {
    log.info(`检查端口 ${PORT} 是否被占用...`);

    const isWindows = os.platform() === 'win32';
    const command = isWindows
      ? `netstat -ano | findstr :${PORT}`
      : `lsof -i :${PORT} | grep LISTEN`;

    exec(command, (error, stdout) => {
      if (error || !stdout.trim()) {
        log.success(`端口 ${PORT} 未被占用`);
        resolve([]);
        return;
      }

      const lines = stdout.trim().split('\n');
      log.warn(`发现 ${lines.length} 个占用端口 ${PORT} 的进程`);

      // 解析进程ID
      const pids = [];
      lines.forEach(line => {
        let pid;
        
        if (isWindows) {
          // Windows 格式: TCP    127.0.0.1:5001    0.0.0.0:0    LISTENING    1234
          const parts = line.trim().split(/\s+/);
          pid = parts[parts.length - 1];
        } else {
          // Unix 格式: node    1234 username   17u  IPv4 12345      0t0  TCP *:5001 (LISTEN)
          const parts = line.trim().split(/\s+/);
          pid = parts[1];
        }

        if (pid && !isNaN(parseInt(pid))) {
          pids.push(pid);
        }
      });

      resolve(pids);
    });
  });
}

// 终止进程
function killProcess(pid) {
  return new Promise((resolve) => {
    const isWindows = os.platform() === 'win32';
    const command = isWindows ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`;
    
    log.warn(`正在终止进程 ID: ${pid}`);
    exec(command, (error) => {
      if (error) {
        log.error(`无法终止进程 ${pid}: ${error.message}`);
      } else {
        log.success(`已终止进程 ${pid}`);
      }
      resolve();
    });
  });
}

// 主函数
async function main() {
  console.log(`\n\x1b[1m端口 ${PORT} 释放工具\x1b[0m`);
  console.log('==================\n');
  
  try {
    // 检查并释放端口
    const pids = await checkPort();
    
    if (pids.length > 0) {
      for (const pid of pids) {
        await killProcess(pid);
      }
      
      log.success(`端口 ${PORT} 已释放完成`);
    } else {
      log.info(`端口 ${PORT} 本来就是空闲的`);
    }
    
  } catch (error) {
    log.error(`释放端口过程中出错: ${error.message}`);
    process.exit(1);
  }
}

// 执行主函数
main();
