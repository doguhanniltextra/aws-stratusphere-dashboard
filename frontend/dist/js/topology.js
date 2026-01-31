
import * as state from './state.js';

let cy = null;

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

    // Initialize Cytoscape
    cy = cytoscape({
        container: container,
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#2f81f7',
                    'label': 'data(label)',
                    'color': '#e6edf3',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '12px',
                    'width': '60px',
                    'height': '60px',
                    'border-width': '2px',
                    'border-color': '#30363d',
                    'text-wrap': 'wrap',
                    'text-max-width': '80px'
                }
            },
            {
                selector: 'node[type="vpc"]',
                style: {
                    'background-color': '#3fb950',
                    'shape': 'roundrectangle',
                    'width': '100px',
                    'height': '80px',
                    'font-size': '14px',
                    'font-weight': 'bold'
                }
            },
            {
                selector: 'node[type="subnet"]',
                style: {
                    'background-color': '#2f81f7',
                    'shape': 'rectangle',
                    'width': '80px',
                    'height': '60px'
                }
            },
            {
                selector: 'node[type="ec2"]',
                style: {
                    'background-color': 'data(bgColor)',
                    'shape': 'ellipse'
                }
            },
            {
                selector: 'node[type="rds"]',
                style: {
                    'background-color': 'data(bgColor)',
                    'shape': 'diamond',
                    'width': '70px',
                    'height': '70px'
                }
            },
            {
                selector: 'node[type="lambda"]',
                style: {
                    'background-color': '#f85149',
                    'shape': 'triangle'
                }
            },
            {
                selector: 'node[type="loadbalancer"]',
                style: {
                    'background-color': '#58a6ff',
                    'shape': 'hexagon',
                    'width': '70px',
                    'height': '70px'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#30363d',
                    'target-arrow-color': '#30363d',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            }
        ],
        layout: {
            name: 'breadthfirst',
            directed: true,
            padding: 50
        },
        wheelSensitivity: 0.2
    });

    // Add hover tooltip using popper
    cy.on('mouseover', 'node', function (evt) {
        const node = evt.target;
        const data = node.data('fullData');
        const type = node.data('type');

        let tooltipContent = `<strong>${node.data('label')}</strong><br>`;

        if (type === 'vpc') {
            tooltipContent += `Type: VPC<br>`;
            tooltipContent += `CIDR: ${data.CIDRBlock || 'N/A'}<br>`;
            tooltipContent += `State: ${data.State || 'N/A'}`;
        } else if (type === 'subnet') {
            tooltipContent += `Type: Subnet<br>`;
            tooltipContent += `CIDR: ${data.CIDRBlock || 'N/A'}<br>`;
            tooltipContent += `AZ: ${data.AvailabilityZone || 'N/A'}`;
        } else if (type === 'ec2') {
            tooltipContent += `Type: EC2 Instance<br>`;
            tooltipContent += `Type: ${data.InstanceType || 'N/A'}<br>`;
            tooltipContent += `State: ${data.State || 'N/A'}<br>`;
            tooltipContent += `IP: ${data.PrivateIpAddress || 'N/A'}`;
        } else if (type === 'rds') {
            tooltipContent += `Type: RDS Instance<br>`;
            tooltipContent += `Engine: ${data.Engine || 'N/A'}<br>`;
            tooltipContent += `Status: ${data.DBInstanceStatus || 'N/A'}`;
        } else if (type === 'lambda') {
            tooltipContent += `Type: Lambda Function<br>`;
            tooltipContent += `Runtime: ${data.Runtime || 'N/A'}<br>`;
            tooltipContent += `Memory: ${data.MemorySize || 'N/A'} MB`;
        } else if (type === 'loadbalancer') {
            tooltipContent += `Type: Load Balancer<br>`;
            tooltipContent += `Type: ${data.Type || 'N/A'}<br>`;
            tooltipContent += `State: ${data.State?.Code || 'N/A'}`;
        }

        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.id = 'cy-tooltip';
        tooltip.innerHTML = tooltipContent;
        tooltip.style.cssText = `
            position: absolute;
            background: var(--bg-secondary);
            border: 1px solid var(--border-default);
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 12px;
            color: var(--text-primary);
            pointer-events: none;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 250px;
        `;

        document.body.appendChild(tooltip);

        // Position tooltip
        const updateTooltipPosition = (e) => {
            tooltip.style.left = (e.renderedPosition.x + 15) + 'px';
            tooltip.style.top = (e.renderedPosition.y + 15) + 'px';
        };

        updateTooltipPosition(evt);
        node.on('position', updateTooltipPosition);

        node.data('tooltipElement', tooltip);
        node.data('tooltipHandler', updateTooltipPosition);
    });

    cy.on('mouseout', 'node', function (evt) {
        const node = evt.target;
        const tooltip = node.data('tooltipElement');

        if (tooltip) {
            tooltip.remove();
            node.removeData('tooltipElement');
        }
    });

    // Add click handler to show details
    cy.on('tap', 'node', function (evt) {
        const node = evt.target;
        const data = node.data('fullData');
        if (data) {
            import('./detailSidebar.js').then(module => {
                module.detailSidebar.show(data);
            });
        }
    });

    // Highlight connected nodes on hover
    cy.on('mouseover', 'node', function (evt) {
        const node = evt.target;
        const connectedEdges = node.connectedEdges();
        const connectedNodes = connectedEdges.connectedNodes();

        // Dim all other nodes
        cy.nodes().not(node).not(connectedNodes).style('opacity', 0.3);
        cy.edges().not(connectedEdges).style('opacity', 0.1);

        // Highlight connected
        connectedEdges.style('line-color', '#58a6ff');
        connectedEdges.style('width', 3);
    });

    cy.on('mouseout', 'node', function (evt) {
        // Reset all styles
        cy.nodes().style('opacity', 1);
        cy.edges().style('opacity', 1);
        cy.edges().style('line-color', '#30363d');
        cy.edges().style('width', 2);
    });

    // Control buttons
    document.getElementById('topologyReset')?.addEventListener('click', () => {
        cy.fit();
        cy.center();
    });

    document.getElementById('topologyFit')?.addEventListener('click', () => {
        cy.fit();
    });
}

export function renderTopology() {
    console.log('renderTopology called');

    if (!cy) {
        console.log('Cytoscape not initialized, initializing now...');
        initTopology();
        if (!cy) {
            console.error('Failed to initialize Cytoscape');
            return;
        }
    }

    const nodes = [];
    const edges = [];

    console.log('Building nodes from state...');
    console.log('VPCs:', state.allVPCs.length);
    console.log('Subnets:', state.allSubnets.length);
    console.log('EC2:', state.allEC2Instances.length);
    console.log('RDS:', state.allRDSInstances.length);
    console.log('Lambda:', state.allLambdaFunctions.length);
    console.log('LB:', state.allLoadBalancers.length);

    // Build nodes from VPCs
    state.allVPCs.forEach(vpc => {
        const vpcId = vpc.VpcId || vpc.ID;
        const vpcName = vpc.Name || (vpcId ? vpcId.substring(0, 12) : 'Unknown VPC');

        if (vpcId) {
            nodes.push({
                data: {
                    id: vpcId,
                    label: vpcName,
                    type: 'vpc',
                    fullData: vpc
                }
            });
        }
    });

    // Build nodes from Subnets and connect to VPCs
    state.allSubnets.forEach(subnet => {
        const subnetId = subnet.SubnetId || subnet.ID;
        const subnetName = subnet.Name || (subnetId ? subnetId.substring(0, 12) : 'Unknown Subnet');
        const vpcId = subnet.VpcId;

        if (subnetId) {
            nodes.push({
                data: {
                    id: subnetId,
                    label: subnetName,
                    type: 'subnet',
                    fullData: subnet
                }
            });

            if (vpcId) {
                edges.push({
                    data: {
                        source: vpcId,
                        target: subnetId
                    }
                });
            }
        }
    });

    // Build nodes from EC2 Instances and connect to Subnets
    state.allEC2Instances.forEach(instance => {
        const instanceId = instance.InstanceId || instance.ID;
        const instanceName = instance.Name || (instanceId ? instanceId.substring(0, 12) : 'Unknown EC2');
        const subnetId = instance.SubnetId;

        if (instanceId) {
            nodes.push({
                data: {
                    id: instanceId,
                    label: instanceName,
                    type: 'ec2',
                    fullData: instance
                }
            });

            if (subnetId) {
                edges.push({
                    data: {
                        source: subnetId,
                        target: instanceId
                    }
                });
            }
        }
    });

    // Build nodes from RDS Instances
    state.allRDSInstances.forEach(rds => {
        const rdsId = rds.DBInstanceIdentifier;
        const rdsName = rdsId ? rdsId.substring(0, 12) : 'Unknown RDS';

        if (rdsId) {
            nodes.push({
                data: {
                    id: rdsId,
                    label: rdsName,
                    type: 'rds',
                    fullData: rds
                }
            });

            // Connect to subnet if available
            if (rds.SubnetGroup) {
                const subnetId = state.allSubnets.find(s =>
                    rds.SubnetGroup.includes(s.SubnetId || s.ID)
                )?.SubnetId || state.allSubnets.find(s =>
                    rds.SubnetGroup.includes(s.SubnetId || s.ID)
                )?.ID;

                if (subnetId) {
                    edges.push({
                        data: {
                            source: subnetId,
                            target: rdsId
                        }
                    });
                }
            }
        }
    });

    // Build nodes from Lambda Functions
    state.allLambdaFunctions.forEach(lambda => {
        const lambdaName = lambda.FunctionName;
        const lambdaLabel = lambdaName ? lambdaName.substring(0, 12) : 'Unknown Lambda';

        if (lambdaName) {
            nodes.push({
                data: {
                    id: lambdaName,
                    label: lambdaLabel,
                    type: 'lambda',
                    fullData: lambda
                }
            });

            // Connect to VPC if Lambda is in VPC
            const vpcId = lambda.VpcId || lambda.VpcConfig?.VpcId;
            if (vpcId) {
                edges.push({
                    data: {
                        source: vpcId,
                        target: lambdaName
                    }
                });
            }
        }
    });

    // Build nodes from Load Balancers
    state.allLoadBalancers.forEach(lb => {
        const lbArn = lb.LoadBalancerArn;
        const lbName = lb.LoadBalancerName || 'LB';
        const lbLabel = lbName.substring(0, 12);

        if (lbArn) {
            nodes.push({
                data: {
                    id: lbArn,
                    label: lbLabel,
                    type: 'loadbalancer',
                    fullData: lb
                }
            });

            const vpcId = lb.VpcId;
            if (vpcId) {
                edges.push({
                    data: {
                        source: vpcId,
                        target: lbArn
                    }
                });
            }
        }
    });

    console.log(`Built ${nodes.length} nodes and ${edges.length} edges`);

    // Update graph
    cy.elements().remove();
    cy.add(nodes);
    cy.add(edges);

    // Apply layout
    cy.layout({
        name: 'breadthfirst',
        directed: true,
        padding: 50,
        spacingFactor: 1.5
    }).run();

    // Fit to screen
    setTimeout(() => {
        cy.fit();
        cy.center();
    }, 100);
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

        const [vpcs, subnets, ec2s, rdss, lambdas, lbs] = await Promise.all([
            window.go.main.App.GetVPCs().catch(e => {
                console.error('VPC fetch error:', e);
                return [];
            }),
            window.go.main.App.GetSubnets().catch(e => {
                console.error('Subnet fetch error:', e);
                return [];
            }),
            window.go.main.App.GetEC2Instances().catch(e => {
                console.error('EC2 fetch error:', e);
                return [];
            }),
            window.go.main.App.GetRDSInstances().catch(e => {
                console.error('RDS fetch error:', e);
                return [];
            }),
            window.go.main.App.GetLambdaFunctions().catch(e => {
                console.error('Lambda fetch error:', e);
                return [];
            }),
            window.go.main.App.GetLoadBalancers().catch(e => {
                console.error('LB fetch error:', e);
                return [];
            })
        ]);

        console.log('Raw data received:');
        console.log('VPCs:', vpcs);
        console.log('Subnets:', subnets);
        console.log('EC2:', ec2s);

        // Update state
        state.setAllVPCs(vpcs || []);
        state.setAllSubnets(subnets || []);
        state.setAllEC2Instances(ec2s || []);
        state.setAllRDSInstances(rdss || []);
        state.setAllLambdaFunctions(lambdas || []);
        state.setAllLoadBalancers(lbs || []);

        console.log('Data fetched successfully:');
        console.log('VPCs:', state.allVPCs.length);
        console.log('Subnets:', state.allSubnets.length);
        console.log('EC2:', state.allEC2Instances.length);
        console.log('RDS:', state.allRDSInstances.length);
        console.log('Lambda:', state.allLambdaFunctions.length);
        console.log('LB:', state.allLoadBalancers.length);

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
