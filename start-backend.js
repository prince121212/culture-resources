/**
 * 文化资源平台 - 后端服务启动脚本
 * 优雅地处理端口占用问题并启动后端服务
 */

const { exec, spawn } = require('child_process');
const os = require('os');
const path = require('path');

// 配置
const PORT = 5001;
const BACKEND_DIR = path.join(__dirname, 'backend');

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

// 启动后端服务
function startBackend() {
  log.info('正在启动后端服务...');
  
  // 使用跨平台方式启动npm命令
  const npmCmd = os.platform() === 'win32' ? 'npm.cmd' : 'npm';
  
  const backend = spawn(npmCmd, ['run', 'dev'], { 
    cwd: BACKEND_DIR,
    stdio: 'inherit',
    shell: true
  });
  
  backend.on('error', (error) => {
    log.error(`启动后端服务失败: ${error.message}`);
  });
  
  // 处理进程退出
  process.on('SIGINT', () => {
    log.warn('接收到中断信号，正在关闭服务...');
    backend.kill();
    process.exit(0);
  });
}

// 主函数
async function main() {
  console.log('\n\x1b[1m文化资源平台 - 后端服务启动器\x1b[0m');
  console.log('============================\n');
  
  try {
    // 检查并释放端口
    const pids = await checkPort();
    
    if (pids.length > 0) {
      for (const pid of pids) {
        await killProcess(pid);
      }
      
      // 等待端口释放
      log.info('等待 2 秒确保端口释放...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // 启动后端服务
    startBackend();
    
  } catch (error) {
    log.error(`启动过程中出错: ${error.message}`);
    process.exit(1);
  }
}

// 执行主函数
main(); 