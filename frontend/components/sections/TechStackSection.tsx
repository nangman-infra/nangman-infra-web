"use client";

import { motion } from "framer-motion";

export function TechStackSection() {
  return (
    <section className="relative z-10 w-full px-4 py-12 md:py-16">
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center space-y-8 md:space-y-12">
          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Expertise
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              네트워크, 운영체제, 클라우드부터 모니터링까지
            </p>
          </motion.div>

          {/* Tech Categories Grid - Modern Minimal Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Network */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <div className="gpu-accelerated-blur group relative h-full p-5 md:p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="text-lg md:text-xl font-semibold mb-4 relative z-10 text-foreground">
                  Network
                </h3>
                <div className="grid grid-cols-2 gap-2 relative z-10">
                  {['TCP/IP', 'DNS', 'Routing', 'CDN'].map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground hover:border-primary/30 hover:text-primary/90 transition-colors duration-200 text-center"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Operating System */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <div className="gpu-accelerated-blur group relative h-full p-5 md:p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="text-lg md:text-xl font-semibold mb-4 relative z-10 text-foreground">
                  OS
                </h3>
                <div className="grid grid-cols-2 gap-2 relative z-10">
                  {['Linux', 'Unix', 'Shell', 'Systemd'].map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground hover:border-primary/30 hover:text-primary/90 transition-colors duration-200 text-center"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Cloud & Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <div className="gpu-accelerated-blur group relative h-full p-5 md:p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="text-lg md:text-xl font-semibold mb-4 relative z-10 text-foreground">
                  Cloud
                </h3>
                <div className="grid grid-cols-2 gap-2 relative z-10">
                  {['AWS', 'Docker', 'K8s', 'Terraform'].map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground hover:border-primary/30 hover:text-primary/90 transition-colors duration-200 text-center"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Database & Monitoring */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <div className="gpu-accelerated-blur group relative h-full p-5 md:p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/40 hover:bg-card/30 transition-all duration-500">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="text-lg md:text-xl font-semibold mb-4 relative z-10 text-foreground">
                  Data & Monitor
                </h3>
                <div className="grid grid-cols-2 gap-2 relative z-10">
                  {['PostgreSQL', 'Redis', 'Prometheus', 'Grafana'].map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1.5 text-xs font-mono rounded-md bg-background/40 border border-border/20 text-muted-foreground hover:border-primary/30 hover:text-primary/90 transition-colors duration-200 text-center"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Additional Tech Stack - Scrolling Marquee */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full pt-8 mt-8 border-t border-border/30"
          >
            <div className="relative overflow-hidden w-full">
              <div className="flex gap-12 md:gap-16 animate-marquee">
                {[
                  'Nginx', 'Ansible', 'Git', 'CI/CD', 'ELK Stack', 'Vault', 'Consul', 'Istio',
                  'Jenkins', 'GitLab', 'Kubernetes', 'Helm', 'ArgoCD', 'Prometheus', 'Grafana', 'Loki',
                  'Terraform', 'Pulumi', 'CloudFormation', 'OpenStack', 'VMware', 'Proxmox',
                  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'RabbitMQ', 'Kafka', 'Elasticsearch',
                  'Python', 'Go', 'Bash', 'YAML', 'JSON', 'HCL', 'Docker Compose', 'Kustomize',
                  'Zabbix', 'Nagios', 'Splunk', 'Datadog', 'New Relic', 'CloudWatch', 'GCP', 'Azure'
                ].map((tech, idx) => (
                  <span
                    key={`tech-${idx}`}
                    className="text-muted-foreground/80 font-mono text-sm md:text-base whitespace-nowrap hover:text-primary transition-colors"
                  >
                    {tech}
                  </span>
                ))}
                {/* Duplicate for seamless infinite scroll */}
                {[
                  'Nginx', 'Ansible', 'Git', 'CI/CD', 'ELK Stack', 'Vault', 'Consul', 'Istio',
                  'Jenkins', 'GitLab', 'Kubernetes', 'Helm', 'ArgoCD', 'Prometheus', 'Grafana', 'Loki',
                  'Terraform', 'Pulumi', 'CloudFormation', 'OpenStack', 'VMware', 'Proxmox',
                  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'RabbitMQ', 'Kafka', 'Elasticsearch',
                  'Python', 'Go', 'Bash', 'YAML', 'JSON', 'HCL', 'Docker Compose', 'Kustomize',
                  'Zabbix', 'Nagios', 'Splunk', 'Datadog', 'New Relic', 'CloudWatch', 'GCP', 'Azure'
                ].map((tech, idx) => (
                  <span
                    key={`tech-dup-${idx}`}
                    className="text-muted-foreground/80 font-mono text-sm md:text-base whitespace-nowrap hover:text-primary transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
