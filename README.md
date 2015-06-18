# Quantum-Bloch-Sphere-Simulator

Simulate quantum states, both pure and mixed, in a Bloch-sphere with various quantum noise channels and gates.
The effects of the various components are shown in real time on the right hand side in the Bloch-spheres.

## Bloch Sphere
Two Bloch-spheres are shown here: one at the top and one at the bottom. The top sphere represents the Bloch-sphere without any influences from settings in the tabs at the bottom left. These changes will be made visible in the bottom sphere. The top sphere can be rotated by the user, the bottom sphere will move with it. 

Computing the vector in the Bloch-sphere that represents a density matrix is done with the following formula: 
ρ = 1/2 (I + a⋅ σ) 
Here a is the Bloch vector of the system and I is the identity. σ represents the three Hermitian, traceless Pauli matrices, also known as the matrices used as the X-, Y- and Z-gate. The Bloch vector can be retrieved by computing the trace of the multication of these Pauli-matrices with the density matrix. The resulting numbers will be the coordinates of the vector.

## Quantum States
In the top left panel up to 4 states can constructed and added to the Bloch-spheres. The states can be constructed with two methods: 

The first one is specifying the polor coordinates the state vector will have in the bloch sphere. As the length of the vector can not be specified, this will always be 1, so these states will always be pure states. From the coordinates the wave function can be determined using the following formula: |Ψ> = cos(θ/2)|0> + sin(θ/2) e<sup>iφ</sup> 
The density matrix can then be constructed by computing |Ψ><Ψ| 

The second way is to directly fill in values in the density matrix. If the user chooses this method, the wave function and polar coordinates will not be updated. This is because not all density matrices can be represented this way. If the density matrix that is filled in is a mixed state, it is impossible to find the wave function.

## Add Noise
In the noise tab various parameters can be set to visualize how noise changes the shape of the bloch sphere, and thus how it changes the pure states, which are on the surface of the sphere. The provided matrices will act on the density matrix according to the following formula: E<sub>1</sub>ρ E<sub>1</sub><sup>†</sup> + E<sub>2</sub>ρE<sub>2</sub><sup>†</sup> 

There are 4 predetermined noise types available: Depolarizing, Dephasing (X or Z) and Amplitude Damping. The corresponding noise matrices and formula for the chosen type of noise will be shown upon selection. For these 4 noise types the amount of noise can be set with the slider at the bottom of the tab. r = 1 means no noise (matrix E<sub>1</sub> will be the identiy and E<sub>2</sub> will be zero) and r = 0 means maximum noise. 

It is also possible for the user to set its own noise matrices. In this case everything is read and computed directly from the matrices the user provides, so the slider with amount of noise 'r' will no longer be of influence. The provided noise matrices have to satisfy the condition: ∑ E<sub>i</sub> E<sub>i</sub><sup>†</sup> = I, with I the identity matrix. If this condition is not met, the transformed Bloch-sphere will not be computed.

## Mixed States
In this tab the user can create a mixed state. The components of the mixed state are the existing states the user created in the top panel. The sliders next to each state show the probability that the state will be created. The active box has to be ticked to include a state with a probability. The sum of all probabilities always adds up to 1, so when including more than two states it becomes difficult for the user to control the sliders to construct the right distribution. For this the 'Lock probability' checkbox was constructed. When ticked, the probability for that state will not change anymore and the other active states will make sure the total probability adds up to 1. 

The generated mixed state is shown as a white arrow in the bloch sphere. Mixed state Bloch vectors have a lenght smaller than 1, so they will end in the Bloch sphere and not on the surface. The transformations in the other tabs will also affect the mixed state.

## Unitary Transformation
In the last tab unitary tranformations can be applied to the states. All the states will be multiplied by the unitary in the following way: U ρ U<sup>†</sup> 

There are 5 predetermined unitaries or gates available in the dropdown menu. The first three are the Pauli-gates, X, Y, Z. On top of that the Hadamard gate and a phase shift gate can be chosen. For the latter one the user has to specify the phase shift in radians. By choosing 'user defined unitary' the user can decide and fill in any valid unitary. 

The other option where user input is needed is the Evolving State. In this case, the unitary is determined by a Hamiltonian and time. The unitary which is applied to the density matrix is time-dependent and can be written as follows: U(t) = e<sup>itH</sup>, where H is the hamiltionian. A slider at the bottom of the tab is provided to see how the states evolve with different time settings to construct an new Unitary.

## License
The MIT License (MIT)

Copyright (c) 2015 Annemieke Verbraeck, Frank Marsman and Tung Phan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
