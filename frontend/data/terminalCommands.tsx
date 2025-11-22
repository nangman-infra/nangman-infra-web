import React from "react";

export interface TerminalCommand {
  command: string;
  output: React.ReactNode[];
}

export const terminalCommands: TerminalCommand[] = [
  {
    command: "top",
    output: [
      <div key="1">top - 15:38:09 up 10 days,  3:12,  1 user,  load average: 0.15, 0.10, 0.05</div>,
      <div key="2">Tasks: 123 total,   1 running, 122 sleeping,   0 stopped,   0 zombie</div>,
      <div key="3" className="text-[#00ff00]">%Cpu(s):  1.2 us,  0.3 sy,  0.0 ni, 98.5 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st</div>,
      <div key="4" className="text-[#ffff00]">MiB Mem :  16000.0 total,   1200.0 free,   4000.0 used,  10800.0 buff/cache</div>,
      <div key="5" className="text-[#ff8800]">MiB Swap:   2000.0 total,   1800.0 free,    200.0 used.  12000.0 avail Mem</div>,
      <div key="6" className="mt-2">
        <div className="grid grid-cols-12 gap-1 text-xs mb-1 text-muted-foreground">
          <span className="col-span-1">PID</span>
          <span className="col-span-2">USER</span>
          <span className="col-span-1">PR</span>
          <span className="col-span-1">NI</span>
          <span className="col-span-2">VIRT</span>
          <span className="col-span-2">RES</span>
          <span className="col-span-1">S</span>
          <span className="col-span-1">%CPU</span>
          <span className="col-span-1">%MEM</span>
          <span className="col-span-2">TIME+</span>
          <span className="col-span-2">COMMAND</span>
        </div>
        <div className="text-xs space-y-0.5">
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-1">1234</span>
            <span className="col-span-2">root</span>
            <span className="col-span-1">20</span>
            <span className="col-span-1">0</span>
            <span className="col-span-2">500000</span>
            <span className="col-span-2">50000</span>
            <span className="col-span-1 text-[#00ff00]">S</span>
            <span className="col-span-1 text-[#ffff00]">0.5</span>
            <span className="col-span-1">0.3</span>
            <span className="col-span-2">0:01.23</span>
            <span className="col-span-2 text-muted-foreground">nginx</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-1">5678</span>
            <span className="col-span-2">user</span>
            <span className="col-span-1">20</span>
            <span className="col-span-1">0</span>
            <span className="col-span-2">300000</span>
            <span className="col-span-2">30000</span>
            <span className="col-span-1 text-[#00ff00]">S</span>
            <span className="col-span-1 text-[#ffff00]">0.3</span>
            <span className="col-span-1">0.2</span>
            <span className="col-span-2">0:00.45</span>
            <span className="col-span-2 text-muted-foreground">sshd</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-1">7890</span>
            <span className="col-span-2">postgres</span>
            <span className="col-span-1">20</span>
            <span className="col-span-1">0</span>
            <span className="col-span-2">800000</span>
            <span className="col-span-2">60000</span>
            <span className="col-span-1 text-[#00ff00]">S</span>
            <span className="col-span-1 text-[#ffff00]">0.2</span>
            <span className="col-span-1">0.4</span>
            <span className="col-span-2">0:05.67</span>
            <span className="col-span-2 text-muted-foreground">postgres</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-1">9012</span>
            <span className="col-span-2">redis</span>
            <span className="col-span-1">20</span>
            <span className="col-span-1">0</span>
            <span className="col-span-2">200000</span>
            <span className="col-span-2">25000</span>
            <span className="col-span-1 text-[#00ff00]">S</span>
            <span className="col-span-1 text-[#ffff00]">0.1</span>
            <span className="col-span-1">0.2</span>
            <span className="col-span-2">0:02.34</span>
            <span className="col-span-2 text-muted-foreground">redis-server</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-1">3456</span>
            <span className="col-span-2">systemd</span>
            <span className="col-span-1">20</span>
            <span className="col-span-1">0</span>
            <span className="col-span-2">150000</span>
            <span className="col-span-2">12000</span>
            <span className="col-span-1 text-[#00ff00]">S</span>
            <span className="col-span-1">0.0</span>
            <span className="col-span-1">0.1</span>
            <span className="col-span-2">0:00.12</span>
            <span className="col-span-2 text-muted-foreground">systemd</span>
          </div>
        </div>
      </div>
    ]
  },
  {
    command: "htop",
    output: [
      <div key="1" className="flex gap-4 text-xs mb-2">
        <div className="flex-1">
          <div className="text-[#00ff00]">1  [<span className="text-[#ffff00]">|||||</span><span className="text-muted-foreground">                                    </span>10.0%]</div>
          <div className="text-[#00ff00]">2  [<span className="text-[#ffff00]">||||</span><span className="text-muted-foreground">                                     </span>5.0%]</div>
          <div className="text-[#00ff00]">3  [<span className="text-[#ffff00]">|||</span><span className="text-muted-foreground">                                      </span>3.0%]</div>
          <div className="text-[#00ff00]">4  [<span className="text-[#ffff00]">|||||</span><span className="text-muted-foreground">                                    </span>8.0%]</div>
        </div>
        <div className="text-xs text-muted-foreground">
          <div>Tasks: 123, 1 running</div>
          <div>Load average: 0.15 0.10 0.05</div>
          <div>Uptime: 10 days, 3:12:08</div>
        </div>
      </div>,
      <div key="2" className="text-xs mb-2">
        <div className="text-[#00aaff]">Mem[<span className="text-[#ffff00]">|||||||||||||||||||||||||||||||||</span><span className="text-muted-foreground">2000/8000MB</span>]</div>
        <div className="text-[#ff8800]">Swp[<span className="text-muted-foreground">                                          </span>0/2000MB]</div>
      </div>,
      <div key="3" className="mt-2 border-t border-border/20 pt-2 text-xs">
        <div className="grid grid-cols-12 gap-1 mb-1 text-muted-foreground">
          <span className="col-span-1">PID</span>
          <span className="col-span-2">USER</span>
          <span className="col-span-1">PRI</span>
          <span className="col-span-1">NI</span>
          <span className="col-span-2">VIRT</span>
          <span className="col-span-2">RES</span>
          <span className="col-span-1">S</span>
          <span className="col-span-1">CPU%</span>
          <span className="col-span-1">MEM%</span>
          <span className="col-span-2">TIME+</span>
          <span className="col-span-2">Command</span>
        </div>
        <div className="space-y-0.5">
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-1">1234</span>
            <span className="col-span-2">root</span>
            <span className="col-span-1">20</span>
            <span className="col-span-1">0</span>
            <span className="col-span-2">500M</span>
            <span className="col-span-2">50M</span>
            <span className="col-span-1 text-[#00ff00]">S</span>
            <span className="col-span-1 text-[#ffff00]">0.5</span>
            <span className="col-span-1">0.6</span>
            <span className="col-span-2">0:01.23</span>
            <span className="col-span-2 text-muted-foreground">nginx</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-1">5678</span>
            <span className="col-span-2">user</span>
            <span className="col-span-1">20</span>
            <span className="col-span-1">0</span>
            <span className="col-span-2">300M</span>
            <span className="col-span-2">30M</span>
            <span className="col-span-1 text-[#00ff00]">S</span>
            <span className="col-span-1 text-[#ffff00]">0.3</span>
            <span className="col-span-1">0.4</span>
            <span className="col-span-2">0:00.45</span>
            <span className="col-span-2 text-muted-foreground">sshd</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-1">7890</span>
            <span className="col-span-2">postgres</span>
            <span className="col-span-1">20</span>
            <span className="col-span-1">0</span>
            <span className="col-span-2">800M</span>
            <span className="col-span-2">60M</span>
            <span className="col-span-1 text-[#00ff00]">S</span>
            <span className="col-span-1 text-[#ffff00]">0.2</span>
            <span className="col-span-1">0.8</span>
            <span className="col-span-2">0:05.67</span>
            <span className="col-span-2 text-muted-foreground">postgres</span>
          </div>
        </div>
      </div>
    ]
  },
  {
    command: "iftop",
    output: [
      <div key="1" className="mb-1">interface: eth0</div>,
      <div key="2" className="mb-1">IP address is: 192.168.1.100</div>,
      <div key="3" className="mb-2">MAC address is: 00:1a:2b:3c:4d:5e</div>,
      <div key="4" className="mb-2">
        <div className="mb-1">
          <span className="text-[#00ff00]">192.168.1.1:443</span>
          <span className="text-muted-foreground">  {'=>'}  </span>
          <span className="text-[#00aaff]">10.0.0.5:54321</span>
          <span className="ml-4 text-[#ffff00]">    2.5Mb  2.5Mb  2.5Mb</span>
        </div>
        <div className="ml-20 mb-2">
          <span className="text-muted-foreground">{'<='}</span>
          <span className="ml-4 text-[#ff8800]">                  850Kb  850Kb  850Kb</span>
        </div>
        <div className="mb-1">
          <span className="text-[#00ff00]">192.168.1.2:80</span>
          <span className="text-muted-foreground">  {'=>'}  </span>
          <span className="text-[#00aaff]">10.0.0.8:8080</span>
          <span className="ml-4 text-[#ffff00]">    1.2Mb  1.2Mb  1.2Mb</span>
        </div>
        <div className="ml-20 mb-2">
          <span className="text-muted-foreground">{'<='}</span>
          <span className="ml-4 text-[#ff8800]">                  600Kb  600Kb  600Kb</span>
        </div>
        <div className="mb-1">
          <span className="text-[#00ff00]">10.0.0.3:3306</span>
          <span className="text-muted-foreground">  {'=>'}  </span>
          <span className="text-[#00aaff]">10.0.0.5:54321</span>
          <span className="ml-4 text-[#ffff00]">    450Kb  450Kb  450Kb</span>
        </div>
        <div className="ml-20">
          <span className="text-muted-foreground">{'<='}</span>
          <span className="ml-4 text-[#ff8800]">                  320Kb  320Kb  320Kb</span>
        </div>
      </div>
    ]
  },
  {
    command: "ss -tuln",
    output: [
      <div key="1" className="grid grid-cols-6 gap-2 mb-1 text-muted-foreground border-b border-border/20 pb-1 text-xs">
        <span>Netid</span>
        <span>State</span>
        <span>Recv-Q</span>
        <span>Send-Q</span>
        <span>Local Address:Port</span>
        <span>Peer Address:Port</span>
      </div>,
      <div key="2" className="space-y-0.5 text-xs">
        <div className="grid grid-cols-6 gap-2">
          <span className="text-[#00ff00]">tcp</span>
          <span className="text-[#00aaff]">ESTAB</span>
          <span>0</span>
          <span>0</span>
          <span>192.168.1.100:22</span>
          <span>192.168.1.1:54321</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          <span className="text-[#00ff00]">tcp</span>
          <span className="text-[#00aaff]">ESTAB</span>
          <span>0</span>
          <span>0</span>
          <span>192.168.1.100:80</span>
          <span>10.0.0.5:45678</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          <span className="text-[#00ff00]">tcp</span>
          <span className="text-[#ffff00]">LISTEN</span>
          <span>0</span>
          <span>128</span>
          <span>0.0.0.0:22</span>
          <span>0.0.0.0:*</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          <span className="text-[#00ff00]">tcp</span>
          <span className="text-[#ffff00]">LISTEN</span>
          <span>0</span>
          <span>128</span>
          <span>0.0.0.0:80</span>
          <span>0.0.0.0:*</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          <span className="text-[#00ff00]">tcp</span>
          <span className="text-[#ffff00]">LISTEN</span>
          <span>0</span>
          <span>128</span>
          <span>127.0.0.1:5432</span>
          <span>*:*</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          <span className="text-[#00ff00]">tcp</span>
          <span className="text-[#ffff00]">LISTEN</span>
          <span>0</span>
          <span>128</span>
          <span>127.0.0.1:6379</span>
          <span>*:*</span>
        </div>
      </div>
    ]
  },
  {
    command: "df -h",
    output: [
      <div key="1" className="grid grid-cols-6 gap-2 mb-1 text-muted-foreground border-b border-border/20 pb-1 text-xs">
        <span>Filesystem</span>
        <span>Size</span>
        <span>Used</span>
        <span>Avail</span>
        <span>Use%</span>
        <span>Mounted on</span>
      </div>,
      <div key="2" className="space-y-0.5 text-xs">
        <div className="grid grid-cols-6 gap-2">
          <span className="text-[#00aaff]">/dev/sda1</span>
          <span>50G</span>
          <span className="text-[#ffff00]">25G</span>
          <span className="text-[#00ff00]">23G</span>
          <span className="text-[#ff8800]">53%</span>
          <span>/</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          <span className="text-[#00aaff]">/dev/sda2</span>
          <span>100G</span>
          <span className="text-[#ffff00]">45G</span>
          <span className="text-[#00ff00]">50G</span>
          <span className="text-[#ffff00]">48%</span>
          <span>/home</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          <span className="text-[#00aaff]">/dev/sda3</span>
          <span>200G</span>
          <span className="text-[#ffff00]">120G</span>
          <span className="text-[#00ff00]">75G</span>
          <span className="text-[#ff8800]">62%</span>
          <span>/var</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          <span className="text-[#00aaff]">tmpfs</span>
          <span>8.0G</span>
          <span>0</span>
          <span className="text-[#00ff00]">8.0G</span>
          <span className="text-[#00ff00]">0%</span>
          <span>/dev/shm</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          <span className="text-[#00aaff]">/dev/mapper/vg0-lv0</span>
          <span>500G</span>
          <span className="text-[#ffff00]">280G</span>
          <span className="text-[#00ff00]">205G</span>
          <span className="text-[#ff8800]">58%</span>
          <span>/data</span>
        </div>
      </div>
    ]
  },
  {
    command: "free -h",
    output: [
      <div key="1" className="grid grid-cols-6 gap-2 mb-1 text-muted-foreground border-b border-border/20 pb-1 text-xs">
        <span></span>
        <span>total</span>
        <span>used</span>
        <span>free</span>
        <span>shared</span>
        <span>buff/cache</span>
        <span>available</span>
      </div>,
      <div key="2" className="space-y-1 text-xs">
        <div className="grid grid-cols-7 gap-2">
          <span className="text-[#00aaff]">Mem:</span>
          <span>16G</span>
          <span className="text-[#ffff00]">4.0G</span>
          <span className="text-[#00ff00]">1.2G</span>
          <span>256M</span>
          <span>10.8G</span>
          <span className="text-[#00ff00]">12.0G</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          <span className="text-[#00aaff]">Swap:</span>
          <span>2.0G</span>
          <span className="text-[#ff8800]">200M</span>
          <span className="text-[#00ff00]">1.8G</span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    ]
  },
  {
    command: "sudo iotop",
    output: [
      <div key="1" className="text-[#ffff00] border-b border-border/20 pb-1 mb-1 text-xs">
        Total DISK READ:  15.23 M/s | Total DISK WRITE:  8.45 M/s
      </div>,
      <div key="2" className="grid grid-cols-7 gap-1 mb-1 text-muted-foreground border-b border-border/20 pb-1 text-xs">
        <span>TID</span>
        <span>PRIO</span>
        <span>USER</span>
        <span>DISK READ</span>
        <span>DISK WRITE</span>
        <span>SWAPIN</span>
        <span>IO</span>
      </div>,
      <div key="3" className="space-y-0.5 text-xs">
        <div className="grid grid-cols-7 gap-1">
          <span>1234</span>
          <span>be/4</span>
          <span className="text-[#00ff00]">root</span>
          <span className="text-[#ffff00]">15.23 M/s</span>
          <span>0.00 B/s</span>
          <span>0.00 %</span>
          <span className="text-[#ff8800]">85.23 %</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          <span>5678</span>
          <span>be/4</span>
          <span className="text-[#00aaff]">user</span>
          <span>0.00 B/s</span>
          <span className="text-[#ffff00]">8.45 M/s</span>
          <span>0.00 %</span>
          <span className="text-[#ff8800]">12.34 %</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          <span>7890</span>
          <span>be/4</span>
          <span className="text-[#00aaff]">postgres</span>
          <span className="text-[#ffff00]">2.10 M/s</span>
          <span className="text-[#ffff00]">1.50 M/s</span>
          <span>0.00 %</span>
          <span className="text-[#ff8800]">8.90 %</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          <span>3456</span>
          <span>be/4</span>
          <span className="text-[#00aaff]">systemd</span>
          <span>0.00 B/s</span>
          <span>0.00 B/s</span>
          <span>0.00 %</span>
          <span>0.00 %</span>
        </div>
      </div>
    ]
  },
  {
    command: "iostat -x 1",
    output: [
      <div key="1" className="text-muted-foreground text-xs mb-2">Linux 5.15.0-91-generic (nangman-infra)  11/21/25  _x86_64_  (4 CPU)</div>,
      <div key="2" className="mb-2 text-xs">
        <div className="text-[#00ff00] mb-1">avg-cpu:  %user   %nice %system %iowait  %steal   %idle</div>
        <div className="ml-12">1.20    0.00    0.30    0.50    0.00   98.00</div>
      </div>,
      <div key="3" className="mt-2 border-t border-border/20 pt-2 text-xs">
        <div className="grid grid-cols-8 gap-1 mb-1 text-muted-foreground">
          <span>Device</span>
          <span>r/s</span>
          <span>w/s</span>
          <span>rkB/s</span>
          <span>wkB/s</span>
          <span>await</span>
          <span>svctm</span>
          <span>%util</span>
        </div>
        <div className="space-y-0.5">
          <div className="grid grid-cols-8 gap-1">
            <span className="text-[#00aaff]">sda</span>
            <span>2.50</span>
            <span>1.20</span>
            <span className="text-[#ffff00]">15.23</span>
            <span className="text-[#ffff00]">8.45</span>
            <span>5.20</span>
            <span>2.10</span>
            <span className="text-[#ff8800]">0.78</span>
          </div>
          <div className="grid grid-cols-8 gap-1">
            <span className="text-[#00aaff]">sdb</span>
            <span>0.50</span>
            <span>0.30</span>
            <span className="text-[#ffff00]">3.20</span>
            <span className="text-[#ffff00]">1.80</span>
            <span>4.50</span>
            <span>1.80</span>
            <span className="text-[#ff8800]">0.15</span>
          </div>
          <div className="grid grid-cols-8 gap-1">
            <span className="text-[#00aaff]">nvme0n1</span>
            <span>5.20</span>
            <span>2.10</span>
            <span className="text-[#ffff00]">42.50</span>
            <span className="text-[#ffff00]">18.30</span>
            <span>2.80</span>
            <span>1.20</span>
            <span className="text-[#ff8800]">0.88</span>
          </div>
        </div>
      </div>
    ]
  },
  {
    command: "journalctl -n 5",
    output: [
      <div key="1" className="text-muted-foreground mb-2 text-xs">
        -- Logs begin at Fri 2025-11-21 00:00:01 UTC, end at Fri 2025-11-21 15:38:09 UTC. --
      </div>,
      <div key="2" className="space-y-1 text-xs">
        <div>
          <span className="text-[#00aaff]">Nov 21 15:38:05</span>
          <span className="ml-2">server</span>
          <span className="ml-2 text-[#00ff00]">nginx[1234]:</span>
          <span className="ml-2">192.168.1.50 - - [21/Nov/2025:15:38:05 +0000] &quot;GET /api/health HTTP/1.1&quot; 200 45 &quot;-&quot; &quot;curl/7.68.0&quot;</span>
        </div>
        <div>
          <span className="text-[#00aaff]">Nov 21 15:37:45</span>
          <span className="ml-2">server</span>
          <span className="ml-2 text-[#00ff00]">postgres[7890]:</span>
          <span className="ml-2">[12345-1] LOG:  checkpoint complete: wrote 1024 buffers (0.5%); 0 WAL file(s) added, 0 removed, 0 recycled</span>
        </div>
        <div>
          <span className="text-[#00aaff]">Nov 21 15:37:30</span>
          <span className="ml-2">server</span>
          <span className="ml-2 text-[#00ff00]">systemd[1]:</span>
          <span className="ml-2">Starting Cleanup of Temporary Directories...</span>
        </div>
        <div>
          <span className="text-[#00aaff]">Nov 21 15:37:31</span>
          <span className="ml-2">server</span>
          <span className="ml-2 text-[#00ff00]">systemd[1]:</span>
          <span className="ml-2">Started Cleanup of Temporary Directories.</span>
        </div>
        <div>
          <span className="text-[#00aaff]">Nov 21 15:35:15</span>
          <span className="ml-2">server</span>
          <span className="ml-2 text-[#00ff00]">sshd[5678]:</span>
          <span className="ml-2">Accepted publickey for user from 192.168.1.1 port 54321 ssh2: RSA SHA256:abc123...</span>
        </div>
      </div>
    ]
  },
  {
    command: "systemctl status nginx",
    output: [
      <div key="1" className="flex items-center gap-2 text-xs mb-2">
        <span className="text-[#00ff00]">●</span>
        <span className="text-[#00aaff]">nginx.service</span>
        <span className="text-muted-foreground">- The nginx HTTP and reverse proxy server</span>
      </div>,
      <div key="2" className="ml-4 space-y-1 text-muted-foreground text-xs mb-2">
        <div>Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)</div>
        <div className="flex items-center gap-2">
          <span>Active:</span>
          <span className="text-[#00ff00]">active (running)</span>
          <span>since Fri 2025-11-21 10:00:00 UTC; 5h 38min ago</span>
        </div>
        <div>Main PID: 1234 (nginx)</div>
        <div>Tasks: 5 (limit: 4915)</div>
        <div>Memory: 50.0M</div>
        <div className="mt-1">CGroup: /system.slice/nginx.service</div>
        <div>Docs: man:nginx(8)</div>
        <div>Process: 1234 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)</div>
        <div>Main PID: 1234 (nginx)</div>
        <div>Tasks: 5 (limit: 4915)</div>
        <div>Memory: 50.0M</div>
        <div>CPU: 1.234s</div>
      </div>,
      <div key="3" className="ml-4 space-y-1 text-xs mb-2">
        <div className="text-muted-foreground">Nov 21 10:00:00 server systemd[1]: Starting The nginx HTTP and reverse proxy server...</div>
        <div className="text-muted-foreground">Nov 21 10:00:00 server nginx[1234]: nginx version: nginx/1.24.0</div>
        <div className="text-muted-foreground">Nov 21 10:00:00 server nginx[1234]: built with OpenSSL 3.0.8 7 Feb 2023</div>
        <div className="text-[#00ff00]">Nov 21 10:00:00 server systemd[1]: Started The nginx HTTP and reverse proxy server.</div>
      </div>,
      <div key="4" className="ml-4 space-y-1 text-xs">
        <div className="text-muted-foreground">CGroup: /system.slice/nginx.service</div>
        <div className="ml-4">├─1234 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;</div>
        <div className="ml-4">├─1235 nginx: worker process</div>
        <div className="ml-4">├─1236 nginx: worker process</div>
        <div className="ml-4">├─1237 nginx: worker process</div>
        <div className="ml-4">└─1238 nginx: worker process</div>
      </div>
    ]
  }
];

