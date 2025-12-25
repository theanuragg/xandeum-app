-- CreateTable
CREATE TABLE "PNode" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "uptime" DOUBLE PRECISION NOT NULL,
    "latency" INTEGER NOT NULL,
    "validations" INTEGER NOT NULL,
    "rewards" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "storageUsed" BIGINT NOT NULL,
    "storageCapacity" BIGINT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performance" DOUBLE PRECISION NOT NULL,
    "stake" DOUBLE PRECISION NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "xdnScore" DOUBLE PRECISION NOT NULL,
    "registered" BOOLEAN NOT NULL,
    "isPublic" BOOLEAN NOT NULL,
    "rpcPort" INTEGER NOT NULL,
    "version" TEXT,
    "storageUsagePercent" DOUBLE PRECISION NOT NULL,
    "cpuPercent" DOUBLE PRECISION NOT NULL,
    "memoryUsed" BIGINT NOT NULL,
    "memoryTotal" BIGINT NOT NULL,
    "packetsIn" INTEGER NOT NULL,
    "packetsOut" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PNodeMetric" (
    "id" TEXT NOT NULL,
    "pnodeId" TEXT NOT NULL,
    "cpuUsagePercent" DOUBLE PRECISION NOT NULL,
    "memoryUsagePercent" DOUBLE PRECISION NOT NULL,
    "networkLatency" INTEGER NOT NULL,
    "bandwidthUsed" BIGINT NOT NULL,
    "diskReadOps" INTEGER NOT NULL,
    "diskWriteOps" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PNodeMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PNodeHistory" (
    "id" TEXT NOT NULL,
    "pnodeId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "latency" INTEGER NOT NULL,
    "uptime" DOUBLE PRECISION NOT NULL,
    "storageUsed" BIGINT NOT NULL,
    "rewards" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PNodeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PNodePeer" (
    "id" TEXT NOT NULL,
    "pnodeId" TEXT NOT NULL,
    "peerId" TEXT NOT NULL,
    "peerName" TEXT NOT NULL,
    "lastConnected" TIMESTAMP(3) NOT NULL,
    "connectionQuality" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PNodePeer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "pnodeId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetworkSnapshot" (
    "id" TEXT NOT NULL,
    "totalNodes" INTEGER NOT NULL,
    "activeNodes" INTEGER NOT NULL,
    "networkHealth" DOUBLE PRECISION NOT NULL,
    "totalRewards" DOUBLE PRECISION NOT NULL,
    "averageLatency" DOUBLE PRECISION NOT NULL,
    "validationRate" DOUBLE PRECISION NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NetworkSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APIUsageLog" (
    "id" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseTimeMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "APIUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CacheInvalidation" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "pattern" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CacheInvalidation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PNode_externalId_key" ON "PNode"("externalId");

-- CreateIndex
CREATE INDEX "PNode_status_idx" ON "PNode"("status");

-- CreateIndex
CREATE INDEX "PNode_xdnScore_idx" ON "PNode"("xdnScore");

-- CreateIndex
CREATE INDEX "PNode_region_idx" ON "PNode"("region");

-- CreateIndex
CREATE INDEX "PNode_lastSeen_idx" ON "PNode"("lastSeen");

-- CreateIndex
CREATE INDEX "PNodeMetric_pnodeId_idx" ON "PNodeMetric"("pnodeId");

-- CreateIndex
CREATE INDEX "PNodeMetric_createdAt_idx" ON "PNodeMetric"("createdAt");

-- CreateIndex
CREATE INDEX "PNodeHistory_pnodeId_idx" ON "PNodeHistory"("pnodeId");

-- CreateIndex
CREATE INDEX "PNodeHistory_timestamp_idx" ON "PNodeHistory"("timestamp");

-- CreateIndex
CREATE INDEX "PNodePeer_pnodeId_idx" ON "PNodePeer"("pnodeId");

-- CreateIndex
CREATE UNIQUE INDEX "PNodePeer_pnodeId_peerId_key" ON "PNodePeer"("pnodeId", "peerId");

-- CreateIndex
CREATE INDEX "Alert_pnodeId_idx" ON "Alert"("pnodeId");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "Alert_isResolved_idx" ON "Alert"("isResolved");

-- CreateIndex
CREATE UNIQUE INDEX "NetworkSnapshot_snapshotDate_key" ON "NetworkSnapshot"("snapshotDate");

-- CreateIndex
CREATE INDEX "APIUsageLog_apiKey_idx" ON "APIUsageLog"("apiKey");

-- CreateIndex
CREATE INDEX "APIUsageLog_createdAt_idx" ON "APIUsageLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CacheInvalidation_key_key" ON "CacheInvalidation"("key");

-- CreateIndex
CREATE INDEX "CacheInvalidation_expiresAt_idx" ON "CacheInvalidation"("expiresAt");

-- AddForeignKey
ALTER TABLE "PNodeMetric" ADD CONSTRAINT "PNodeMetric_pnodeId_fkey" FOREIGN KEY ("pnodeId") REFERENCES "PNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PNodeHistory" ADD CONSTRAINT "PNodeHistory_pnodeId_fkey" FOREIGN KEY ("pnodeId") REFERENCES "PNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PNodePeer" ADD CONSTRAINT "PNodePeer_pnodeId_fkey" FOREIGN KEY ("pnodeId") REFERENCES "PNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_pnodeId_fkey" FOREIGN KEY ("pnodeId") REFERENCES "PNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
