
import * as state from './state.js';

let cy = null;

// Initial configuration
export function initTopology() {
    const container = document.getElementById('cy');
    if (!container) {
        console.error('Topology container not found');
        return;
    }

    // Check if Cytoscape is loaded
    if (typeof cytoscape === 'undefined') {
        console.error('Cytoscape library not loaded');
        return;
    }

    console.log('Initializing Cytoscape...');

    // Remove any existing instance to be clean
    if (typeof cy !== 'undefined' && cy) {
        try { cy.destroy(); } catch (e) { console.error("Error destroying existing Cytoscape instance:", e); }
    }

    // Initialize Cytoscape with PRESET layout (no movement)
    cy = cytoscape({
        container: container,
        style: [
            // Core Nodes (Resources)
            {
                selector: 'node',
                style: {
                    'background-color': '#2f81f7',
                    'label': 'data(label)',
                    'color': '#e6edf3',
                    'text-valign': 'bottom',
                    'text-halign': 'center',
                    'text-margin-y': '6px',
                    'font-size': '11px',
                    'width': '50px',
                    'height': '50px',
                    'border-width': '0px',
                    'text-wrap': 'wrap',
                    'text-max-width': '80px'
                }
            },
            // Parent: VPC
            {
                selector: 'node[type="vpc"]',
                style: {
                    'background-color': 'rgba(22, 27, 34, 0.5)',
                    'border-width': 2,
                    'border-color': '#3fb950',
                    'border-style': 'solid',
                    'shape': 'roundrectangle',
                    'text-valign': 'top',
                    'text-halign': 'center',
                    'color': '#3fb950',
                    'font-weight': 'bold',
                    'font-size': '16px',
                    'padding': '10px',
                    'text-margin-y': '-25px'
                }
            },
            // Parent: Subnet
            {
                selector: 'node[type="subnet"]',
                style: {
                    'background-color': 'rgba(48, 54, 61, 0.5)',
                    'border-width': 1,
                    'border-color': '#2f81f7',
                    'border-style': 'dashed',
                    'shape': 'roundrectangle',
                    'text-valign': 'top',
                    'text-halign': 'center',
                    'color': '#58a6ff',
                    'font-size': '12px',
                    'padding': '10px',
                    'text-margin-y': '-20px'
                }
            },
            { selector: 'node[type="ec2"]', style: { 'background-color': 'data(bgColor)', 'shape': 'ellipse', 'border-width': 1, 'border-color': '#fff', 'width': '40px', 'height': '40px' } },
            { selector: 'node[type="rds"]', style: { 'background-color': 'data(bgColor)', 'shape': 'round-rectangle', 'width': '40px', 'height': '40px' } },
            { selector: 'node[type="lambda"]', style: { 'background-color': '#f85149', 'shape': 'triangle', 'width': '40px', 'height': '40px' } },
            { selector: 'node[type="loadbalancer"]', style: { 'background-color': '#58a6ff', 'shape': 'diamond', 'width': '40px', 'height': '40px' } },
            // New Network Components
            { selector: 'node[type="nat"]', style: { 'background-color': '#a371f7', 'shape': 'pentagon', 'width': '35px', 'height': '35px', 'label': 'NAT' } },
            { selector: 'node[type="rtb"]', style: { 'background-color': '#d29922', 'shape': 'round-tag', 'width': '30px', 'height': '30px', 'font-size': '9px' } },
            { selector: 'node[type="sg"]', style: { 'background-color': '#6e7681', 'shape': 'shield', 'width': '30px', 'height': '30px', 'font-size': '9px' } },
            { selector: 'node[type="s3"]', style: { 'background-color': '#ff9900', 'shape': 'barrel', 'width': '35px', 'height': '35px', 'label': 'data(label)' } },
            { selector: 'edge', style: { 'width': 2, 'line-color': '#8b949e', 'target-arrow-color': '#8b949e', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'opacity': 0.7 } },
            { selector: ':selected', style: { 'border-width': 2, 'border-color': '#e6edf3', 'border-style': 'solid' } }
        ],
        layout: { name: 'preset' }, // ABSOLUTELY NO PHYSICS
        wheelSensitivity: 0.2
    });

    // Add tooltips
    cy.on('mouseover', 'node', function (evt) {
        const node = evt.target;
        const data = node.data('fullData');

        let tooltipContent = `<strong>${node.data('label')}</strong><br>`;
        if (data) {
            // Add a few key details specific to type
            if (node.data('type') === 'vpc') tooltipContent += `CIDR: ${data.CIDRBlock || data.CidrBlock || 'N/A'}`;
            if (node.data('type') === 'subnet') tooltipContent += `AZ: ${data.AvailabilityZone || data.availabilityZone || 'N/A'}`;
            if (node.data('type') === 'ec2') tooltipContent += `IP: ${data.PrivateIpAddress || data.PrivateIPAddress || 'N/A'}`;
            if (node.data('type') === 'nat') tooltipContent += `Public IP: ${data.PublicIP || 'N/A'}`;
            if (node.data('type') === 'rtb') tooltipContent += `Routes: ${data.Routes || 0}`;
            if (node.data('type') === 'sg') tooltipContent += `Desc: ${data.Description || ''}`;
            if (node.data('type') === 'rds') tooltipContent += `Status: ${data.DBInstanceStatus || 'N/A'}`;
            if (node.data('type') === 'lambda') tooltipContent += `Runtime: ${data.Runtime || 'N/A'}`;
            if (node.data('type') === 'loadbalancer') tooltipContent += `Type: ${data.Type || 'N/A'}`;
        }

        const tooltip = document.createElement('div');
        tooltip.id = 'cy-tooltip';
        tooltip.innerHTML = tooltipContent;
        tooltip.style.cssText = `position: absolute; background: var(--bg-secondary); border: 1px solid var(--border-default); border-radius: 6px; padding: 8px 12px; font-size: 12px; color: var(--text-primary); pointer-events: none; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 250px;`;
        document.body.appendChild(tooltip);

        const updateTooltipPosition = (e) => {
            tooltip.style.left = (e.renderedPosition.x + 15) + 'px';
            tooltip.style.top = (e.renderedPosition.y + 15) + 'px';
        };
        updateTooltipPosition(evt);
        node.data('tooltipElement', tooltip);
        node.data('tooltipHandler', updateTooltipPosition);
    });

    cy.on('mouseout', 'node', function (evt) {
        const node = evt.target;
        const tooltip = node.data('tooltipElement');
        if (tooltip) {
            tooltip.remove();
            node.removeData('tooltipElement');
            node.removeData('tooltipHandler'); // Clean up handler reference
        }
    });

    // Click handler for sidebar
    cy.on('tap', 'node', function (evt) {
        if (evt.target === evt.cy) return; // Don't trigger if clicked on canvas background
        const node = evt.target;
        const data = node.data('fullData');
        if (data) {
            import('./detailSidebar.js').then(module => {
                module.detailSidebar.show(data);
            });
        }
    });

    // Reset buttons
    document.getElementById('topologyReset')?.addEventListener('click', () => { cy.fit(); cy.center(); });
    document.getElementById('topologyFit')?.addEventListener('click', () => { cy.fit(); });
}

export function renderTopology() {
    console.log('Rendering Topology...');
    if (!cy || cy.destroyed()) {
        initTopology();
    }

    const nodes = [];
    const createdIds = new Set();

    // Robust ID helper: Handles int/string, trims, ignores empty
    const getId = (val) => {
        if (val === undefined || val === null || val === '') return null;
        return String(val).trim();
    };

    // 1. VPCs
    if (state.allVPCs) {
        state.allVPCs.forEach(vpc => {
            // Wails structs usually have UpperCamelCase for fields
            const id = getId(vpc.ID || vpc.VpcId || vpc.vpcId || vpc.id);
            const name = vpc.Name || vpc.name || id;

            if (id && !createdIds.has(id)) {
                nodes.push({ group: 'nodes', data: { id: id, label: name, type: 'vpc', fullData: vpc } });
                createdIds.add(id);
            }
        });
    }

    // 2. Subnets
    if (state.allSubnets) {
        state.allSubnets.forEach(sub => {
            const id = getId(sub.ID || sub.SubnetId || sub.subnetId);
            const name = sub.Name || sub.name || id;
            const parentId = getId(sub.VPCID || sub.VpcId || sub.vpcId);

            if (id && !createdIds.has(id)) {
                const node = { group: 'nodes', data: { id: id, label: name, type: 'subnet', fullData: sub } };
                if (parentId && createdIds.has(parentId)) {
                    node.data.parent = parentId;
                }
                nodes.push(node);
                createdIds.add(id);
            }
        });
    }

    // 3. EC2
    if (state.allEC2Instances) {
        state.allEC2Instances.forEach(ec2 => {
            const id = getId(ec2.ID || ec2.InstanceId || ec2.instanceId || ec2.id);
            const name = ec2.Name || ec2.name || id;
            // Robust checks for SubnetID (Go struct often sends SubnetID)
            const subnetId = getId(ec2.SubnetID || ec2.SubnetId || ec2.subnetID || ec2.subnetId);
            const vpcId = getId(ec2.VPCID || ec2.VpcId || ec2.vpcID || ec2.vpcId);

            if (id && !createdIds.has(id)) {
                const node = {
                    group: 'nodes',
                    data: {
                        id: id,
                        label: name,
                        type: 'ec2',
                        bgColor: (ec2.State?.Name === 'running' || ec2.state === 'running' || ec2.State === 'running') ? '#3fb950' : '#8b949e',
                        fullData: ec2
                    }
                };
                // Prioritize subnet as parent, fallback to VPC
                if (subnetId && createdIds.has(subnetId)) {
                    node.data.parent = subnetId;
                } else if (vpcId && createdIds.has(vpcId)) {
                    node.data.parent = vpcId;
                } else {
                    console.warn(`EC2 ${name} orphaned. SubnetID: ${subnetId}, VPCID: ${vpcId}`);
                }
                nodes.push(node);
                createdIds.add(id);
            }
        });
    }

    // 4. NAT Gateways
    if (state.allNATGateways) {
        state.allNATGateways.forEach(nat => {
            const id = getId(nat.ID || nat.NatGatewayId || nat.natGatewayId || nat.id);
            const subnetId = getId(nat.SubnetID || nat.SubnetId || nat.subnetId || nat.subnetID);
            const name = nat.Name || nat.name || 'NAT';

            if (id && !createdIds.has(id)) {
                const node = { group: 'nodes', data: { id: id, label: name, type: 'nat', fullData: nat } };
                if (subnetId && createdIds.has(subnetId)) {
                    node.data.parent = subnetId;
                }
                nodes.push(node);
                createdIds.add(id);
            }
        });
    }

    // 5. Route Tables
    if (state.allRouteTables) {
        state.allRouteTables.forEach(rtb => {
            const rawID = getId(rtb.ID || rtb.RouteTableId || rtb.routeTableId || rtb.id);
            const name = rtb.Name || rtb.name || 'RTB';
            const vpcId = getId(rtb.VPCID || rtb.VpcId || rtb.vpcId || rtb.vpcID);
            // Handle array casing
            const subnetIds = rtb.SubnetIDs || rtb.SubnetIds || rtb.subnetIDs || rtb.subnetIds || [];

            console.log(`Processing RTB: ${rawID}, Subnets: ${subnetIds.length}`);

            // If Associated with Subnets, default to first one for visualization or duplicate?
            // Duplication logic:
            if (subnetIds.length > 0) {
                subnetIds.forEach((sid, index) => {
                    const safeSubId = getId(sid);
                    if (safeSubId && createdIds.has(safeSubId)) {
                        // Create a unique ID for this instance of the RTB
                        const uniqueId = `${rawID}_${safeSubId}`;
                        if (!createdIds.has(uniqueId)) {
                            nodes.push({
                                group: 'nodes',
                                data: {
                                    id: uniqueId,
                                    label: name,
                                    type: 'rtb',
                                    parent: safeSubId,
                                    fullData: rtb
                                }
                            });
                            createdIds.add(uniqueId);
                        }
                    } else {
                        console.warn(`RTB ${rawID} references unknown subnet ${sid}`);
                    }
                });
            } else {
                // Main RTB or no explicit subnet association -> Put in VPC
                if (rawID && !createdIds.has(rawID)) {
                    const node = { group: 'nodes', data: { id: rawID, label: 'Main ' + name, type: 'rtb', fullData: rtb } };
                    if (vpcId && createdIds.has(vpcId)) {
                        node.data.parent = vpcId;
                    }
                    nodes.push(node);
                    createdIds.add(rawID);
                }
            }
        });
    }

    // 6. Security Groups
    if (state.allSecurityGroups) {
        state.allSecurityGroups.forEach(sg => {
            const id = getId(sg.ID || sg.GroupId || sg.groupId || sg.id);
            const name = sg.Name || sg.GroupName || sg.groupName || 'SG';
            const vpcId = getId(sg.VPCID || sg.VpcId || sg.vpcId || sg.vpcID);

            if (id && !createdIds.has(id)) {
                const node = { group: 'nodes', data: { id: id, label: name, type: 'sg', fullData: sg } };
                if (vpcId && createdIds.has(vpcId)) {
                    node.data.parent = vpcId;
                }
                nodes.push(node);
                createdIds.add(id);
            }
        });
    }

    // 7. RDS
    if (state.allRDSInstances) {
        state.allRDSInstances.forEach(rds => {
            const id = getId(rds.DBInstanceIdentifier || rds.dbInstanceIdentifier);
            const vpcId = getId(rds.VpcId || rds.vpcId || rds.VPCID || rds.vpcID);

            if (id && !createdIds.has(id)) {
                const node = {
                    group: 'nodes',
                    data: {
                        id: id,
                        label: id,
                        type: 'rds',
                        bgColor: (rds.DBInstanceStatus === 'available' || rds.dbInstanceStatus === 'available') ? '#3fb950' : '#8b949e',
                        fullData: rds
                    }
                };
                // Try subnet group check if available
                let parentFound = false;
                if (rds.DBSubnetGroup?.Subnets && Array.isArray(rds.DBSubnetGroup.Subnets)) {
                    for (const sub of rds.DBSubnetGroup.Subnets) {
                        const subId = getId(sub.SubnetIdentifier || sub.subnetIdentifier);
                        if (subId && createdIds.has(subId)) {
                            node.data.parent = subId;
                            parentFound = true;
                            break;
                        }
                    }
                }

                if (!parentFound && vpcId && createdIds.has(vpcId)) {
                    node.data.parent = vpcId;
                }
                nodes.push(node);
                createdIds.add(id);
            }
        });
    }

    // 8. Lambda Functions
    if (state.allLambdaFunctions) {
        state.allLambdaFunctions.forEach(lambda => {
            const id = getId(lambda.FunctionName || lambda.functionName);
            if (id && !createdIds.has(id)) {
                const nodeData = {
                    id: id,
                    label: id,
                    type: 'lambda',
                    fullData: lambda
                };

                const vpcConfig = lambda.VpcConfig || lambda.vpcConfig;
                const vpcId = getId(lambda.VpcId || lambda.vpcId || (vpcConfig ? (vpcConfig.VpcId || vpcConfig.vpcId) : null));
                if (vpcId && createdIds.has(vpcId)) {
                    nodeData.parent = vpcId;
                }

                nodes.push({
                    group: 'nodes',
                    data: nodeData
                });
                createdIds.add(id);
            }
        });
    }

    // 9. Load Balancers
    if (state.allLoadBalancers) {
        state.allLoadBalancers.forEach(lb => {
            const id = getId(lb.LoadBalancerArn || lb.loadBalancerArn || lb.ARN || lb.arn);
            const name = lb.LoadBalancerName || lb.loadBalancerName || lb.Name || lb.name;

            if (id && !createdIds.has(id)) {
                const nodeData = {
                    id: id,
                    label: name,
                    type: 'loadbalancer',
                    fullData: lb
                };

                const vpcId = getId(lb.VpcId || lb.vpcId || lb.VPCID || lb.vpcID);
                if (vpcId && createdIds.has(vpcId)) {
                    nodeData.parent = vpcId;
                }

                nodes.push({
                    group: 'nodes',
                    data: nodeData
                });
                createdIds.add(id);
            }
        });
    }

    // 10. S3 Buckets
    if (state.allS3Buckets) {
        state.allS3Buckets.forEach(b => {
            const name = b.Name || b.name;
            // S3 has no ID usually, use name
            const id = getId(name);
            if (id && !createdIds.has(id)) {
                nodes.push({
                    group: 'nodes',
                    data: { id: id, label: name, type: 's3', fullData: b }
                });
                createdIds.add(id);
            }
        });
    }

    console.log(`Built ${nodes.length} nodes`);

    cy.elements().remove();
    cy.add(nodes);

    // COSE LAYOUT (Calculated physically but rendered statically)
    // This handles compound node sizing and separation better than breadthfirst
    cy.layout({
        name: 'cose',
        animate: false, // CRITICAL: No animation = No "flying"
        randomize: true,
        componentSpacing: 100, // Ensure distinct VPCs are far apart
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 50,
        boundingBox: undefined,
        nodeDimensionsIncludeLabels: true, // Key for boxes not ignoring labels
        nestingFactor: 1.2, // Good expansion for parents
        gravity: 1, // Keep components tight internally
        numIter: 1000, // Run enough iterations to stabilize before verifying
        initialTemp: 1000,
        coolingFactor: 0.99,
        minTemp: 1.0
    }).run();

    // Fit
    cy.fit();
}

export async function showTopology() {
    console.log('showTopology called');
    state.setCurrentPage('topology');

    // Hide VPC grid
    const vpcGrid = document.getElementById('vpcGrid');
    if (vpcGrid) vpcGrid.classList.add('hidden');

    // Hide all table containers
    const tableContainers = [
        'vpcTable', 'subnetTable', 'ec2Table', 'ecsTable',
        'securityGroupTable', 'natTable', 'routeTable', 's3Table',
        'tgTable', 'lbTable', 'eipTable', 'lambdaTable', 'rdsTable'
    ];

    tableContainers.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    // Show topology container
    const container = document.getElementById('topologyContainer');
    if (container) {
        container.classList.remove('hidden');
        console.log('Topology container shown');
    } else {
        console.error('Topology container not found!');
        return;
    }

    // Update status
    const statusText = document.getElementById('statusText');
    if (statusText) {
        statusText.textContent = 'Loading topology...';
    }

    // Fetch all data directly from backend
    try {
        console.log('Fetching data from backend...');

        // Check if window.go is available
        if (!window.go || !window.go.main || !window.go.main.App) {
            throw new Error('Wails backend not available. Make sure the app is running.');
        }

        const [vpcs, subnets, ec2s, rdss, lambdas, lbs, s3s] = await Promise.all([
            window.go.main.App.GetVPCs().catch(e => { console.error('VPC fetch error:', e); return []; }),
            window.go.main.App.GetSubnets().catch(e => { console.error('Subnet fetch error:', e); return []; }),
            window.go.main.App.GetEC2Instances().catch(e => { console.error('EC2 fetch error:', e); return []; }),
            window.go.main.App.GetRDSInstances().catch(e => { console.error('RDS fetch error:', e); return []; }),
            window.go.main.App.GetLambdaFunctions().catch(e => { console.error('Lambda fetch error:', e); return []; }),
            window.go.main.App.GetLoadBalancers().catch(e => { console.error('LB fetch error:', e); return []; }),
            window.go.main.App.GetS3Buckets().catch(e => { console.error('S3 fetch error:', e); return []; })
        ]);

        console.log('Raw data received:');
        console.log('VPCs:', vpcs);
        console.log('Subnets:', subnets);

        // Update state
        state.setAllVPCs(vpcs || []);
        state.setAllSubnets(subnets || []);
        state.setAllEC2Instances(ec2s || []);
        state.setAllRDSInstances(rdss || []);
        state.setAllLambdaFunctions(lambdas || []);
        state.setAllLoadBalancers(lbs || []);
        state.setAllS3Buckets(s3s || []);

        console.log('Data fetched successfully:');
        console.log('VPCs:', state.allVPCs.length);
        console.log('Subnets:', state.allSubnets.length);
        console.log('EC2:', state.allEC2Instances.length);
        console.log('RDS:', state.allRDSInstances.length);
        console.log('Lambda:', state.allLambdaFunctions.length);
        console.log('LB:', state.allLoadBalancers.length);
        console.log('S3:', state.allS3Buckets.length);

        // Render topology with real data
        renderTopology();

        if (statusText) {
            const totalNodes = state.allVPCs.length + state.allSubnets.length +
                state.allEC2Instances.length + state.allRDSInstances.length +
                state.allLambdaFunctions.length + state.allLoadBalancers.length;
            statusText.textContent = `Topology: ${totalNodes} resources`;
        }
    } catch (error) {
        console.error('Error loading topology data:', error);
        console.error('Error stack:', error.stack);
        if (statusText) {
            statusText.textContent = `Error loading topology: ${error.message}`;
        }
    }
}

export function hideTopology() {
    const container = document.getElementById('topologyContainer');
    if (container) {
        container.classList.add('hidden');
    }
}
